let data = null;
let quizQuestions = [];
let evalQuestions = [];
let quizIndex = 0;
let evalIndex = 0;
let scoreQuiz = 0;
let scoreEval = 0;
let detailsQuiz = [];
let detailsEval = [];
let timerQuiz = null;
let timerEval = null;
let tempsQuizRestant = 20 * 60;

function $(s) { return document.querySelector(s); }
function $$(s) { return document.querySelectorAll(s); }

function shuffle(a) {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
}

function fmt(s) {
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

function norm(t, ic, ia) {
    let r = t.trim().toLowerCase();
    if (ia) r = r.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return r;
}

function remplacerTrous(texte, elements) {
    const p = texte.split('{{}}');
    let r = p[0];
    for (let i = 0; i < elements.length; i++) r += elements[i] + (p[i+1] || '');
    return r;
}

async function chargerDonnees() {
    try {
        const res = await fetch('questions.json?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
    } catch (e) {
        try { data = JSON.parse($('#questions-data-inline').textContent); }
        catch (e2) {
            document.body.innerHTML = '<div style="max-width:600px;margin:4rem auto;padding:2rem;background:#fee2e2;border:2px solid #ef4444;border-radius:12px;"><h2>⚠️ Erreur</h2><p>Impossible de charger les questions.</p><button onclick="location.reload()">Réessayer</button></div>';
            return;
        }
    }
    initialiserCours();
    preparerQuiz();
    preparerEval();
}

function initialiserCours() {
    let h = `<div class="intro"><strong>🎯 Introduction :</strong> ${data.cours.introduction}</div>`;
    data.cours.sections.forEach(s => { h += `<div class="section-cours"><h3>${s.titre}</h3><p>${s.contenu}</p></div>`; });
    $('#contenu-cours').innerHTML = h;
}

function preparerQuiz() {
    quizQuestions = shuffle(data.quizComprehension).map(q => ({ ...q, options: shuffle(q.options) }));
    $('#btn-commencer-quiz').addEventListener('click', demarrerQuiz);
}

function demarrerQuiz() {
    $('#section-cours').classList.add('hidden');
    $('#section-quiz').classList.remove('hidden');
    quizIndex = 0; scoreQuiz = 0; detailsQuiz = [];
    tempsQuizRestant = 20 * 60;
    afficherQuestionQuiz();
    lancerTimerQuiz();
}

function afficherQuestionQuiz() {
    if (quizIndex >= quizQuestions.length) { terminerQuiz(); return; }
    const q = quizQuestions[quizIndex];
    $('#quiz-progress').textContent = `Question ${quizIndex+1} / ${quizQuestions.length}`;
    $('#quiz-progress-bar').style.width = `${(quizIndex/quizQuestions.length)*100}%`;
    $('#quiz-question').innerHTML = `<strong>Q${quizIndex+1}.</strong> ${q.question}`;
    const d = $('#quiz-options'); d.innerHTML = '';
    q.options.forEach((o, i) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `<input type="radio" name="qo" id="qo${i}" value="${i}"><label for="qo${i}">${o.texte}</label>`;
        div.addEventListener('click', () => {
            $$('#quiz-options .option-item').forEach(e => e.classList.remove('selected'));
            div.classList.add('selected'); div.querySelector('input').checked = true;
        });
        d.appendChild(div);
    });
    $('#btn-suivant-quiz').classList.remove('hidden');
}

function lancerTimerQuiz() {
    clearInterval(timerQuiz);
    $('#quiz-timer').textContent = `⏱️ ${fmt(tempsQuizRestant)}`;
    timerQuiz = setInterval(() => {
        tempsQuizRestant--;
        const t = $('#quiz-timer');
        t.textContent = `⏱️ ${fmt(tempsQuizRestant)}`;
        t.classList.toggle('warning', tempsQuizRestant < 60);
        if (tempsQuizRestant <= 0) { clearInterval(timerQuiz); terminerQuiz(); }
    }, 1000);
}

$('#btn-suivant-quiz').addEventListener('click', () => {
    const sel = document.querySelector('input[name="qo"]:checked');
    const q = quizQuestions[quizIndex];
    let ok = false;
    if (sel) { ok = q.options[parseInt(sel.value)].correct; if (ok) scoreQuiz++; }
    detailsQuiz.push({
        question: q.question,
        reponseEleve: sel ? q.options[parseInt(sel.value)].texte : 'Aucune',
        bonneReponse: q.options.find(o => o.correct).texte,
        correct: ok
    });
    quizIndex++;
    afficherQuestionQuiz();
});

function terminerQuiz() {
    clearInterval(timerQuiz);
    $('#section-quiz').classList.add('hidden');
    $('#section-eval').classList.remove('hidden');
    evalIndex = 0; scoreEval = 0; detailsEval = [];
    afficherExerciceEval();
}

function preparerEval() {
    evalQuestions = shuffle(data.evaluation);
    $('#btn-suivant-eval').addEventListener('click', () => validerEtSuivantEval());
}

function afficherExerciceEval() {
    if (evalIndex >= evalQuestions.length) { terminerEval(); return; }
    const ex = evalQuestions[evalIndex];
    $('#eval-progress').textContent = `Exercice ${evalIndex+1} / ${evalQuestions.length}`;
    $('#eval-progress-bar').style.width = `${(evalIndex/evalQuestions.length)*100}%`;
    const bg = ex.niveau === 'Facile' ? 'facile' : ex.niveau === 'Moyen' ? 'moyen' : 'avance';
    $('#eval-question').innerHTML = `<strong>${ex.titre}</strong> <span class="badge badge-${bg}">${ex.niveau}</span><br><br>${ex.enonce}`;
    const c = $('#eval-content'); c.innerHTML = '';
    const R = {
        'tableau-menu': renderTableauMenu,
        'choix-unique': renderChoixUnique,
        'choix-multiple': renderChoixMultiple,
        'valeur-numerique': renderValeurNumerique,
        'reponse-saisie': renderReponseSaisie,
        'association': renderAssociation,
        'texte-trous-libre': renderTrousLibre,
        'texte-trous-liste-unique': renderTrousListeUnique,
        'texte-trous-liste-variable': renderTrousListeVariable
    };
    if (R[ex.type]) R[ex.type](ex, c);
    lancerTimerEval();
}

function lancerTimerEval() {
    clearInterval(timerEval);
    let t = 90;
    const el = $('#eval-timer');
    el.textContent = `⏱️ ${fmt(t)}`; el.classList.remove('warning');
    timerEval = setInterval(() => {
        t--;
        el.textContent = `⏱️ ${fmt(t)}`;
        if (t < 10) el.classList.add('warning');
        if (t <= 0) { clearInterval(timerEval); validerEtSuivantEval(); }
    }, 1000);
}

function renderTableauMenu(ex, c) {
    const tbl = document.createElement('table');
    tbl.className = 'tableau-menu';
    tbl.innerHTML = '<thead><tr><th>N°</th><th>Énoncé</th><th>Réponse</th></tr></thead>';
    const tb = document.createElement('tbody');
    shuffle([...ex.questions]).forEach((q, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="num">${i+1}</td><td>${q.enonce}</td><td></td>`;
        const s = document.createElement('select');
        s.dataset.qid = q.id; s.dataset.pts = q.pts;
        s.innerHTML = '<option value="">-- Choisir --</option>';
        shuffle([...q.options]).forEach(o => {
            const op = document.createElement('option');
            op.value = o.texte; op.dataset.correct = o.correct; op.textContent = o.texte;
            s.appendChild(op);
        });
        tr.cells[2].appendChild(s); tb.appendChild(tr);
    });
    tbl.appendChild(tb); c.appendChild(tbl);
}

function renderChoixUnique(ex, c) {
    shuffle([...ex.options]).forEach((o, i) => {
        const d = document.createElement('div'); d.className = 'option-item';
        d.innerHTML = `<input type="radio" name="cu" id="cu${i}" value="${i}"><label for="cu${i}">${o.texte}</label>`;
        d.addEventListener('click', () => {
            $$('#eval-content .option-item').forEach(e => e.classList.remove('selected'));
            d.classList.add('selected'); d.querySelector('input').checked = true;
        });
        c.appendChild(d);
    });
}

function renderChoixMultiple(ex, c) {
    shuffle([...ex.options]).forEach((o, i) => {
        const d = document.createElement('div'); d.className = 'option-item';
        d.innerHTML = `<input type="checkbox" id="cm${i}" value="${i}"><label for="cm${i}">${o.texte}</label>`;
        d.addEventListener('click', e => {
            if (e.target.tagName !== 'INPUT') { const cb = d.querySelector('input'); cb.checked = !cb.checked; }
            d.classList.toggle('selected', d.querySelector('input').checked);
        });
        c.appendChild(d);
    });
}

function renderValeurNumerique(ex, c) {
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'reponse-saisie-input';
    inp.placeholder = 'Saisis ta réponse numérique...'; inp.id = 'vn-input';
    c.appendChild(inp);
}

function renderReponseSaisie(ex, c) {
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'reponse-saisie-input';
    inp.placeholder = 'Saisis ta réponse...'; inp.id = 'rs-input';
    c.appendChild(inp);
}

function renderAssociation(ex, c) {
    const div = document.createElement('div');
    div.className = 'association-container';
    const col = document.createElement('div');
    col.className = 'association-colonne';
    col.innerHTML = '<h4>Associe chaque concept à sa définition</h4>';
    const defs = shuffle(ex.associations.map(a => a.definition));
    shuffle([...ex.associations]).forEach(a => {
        const item = document.createElement('div');
        item.className = 'association-item';
        item.dataset.terme = a.terme; item.dataset.pts = a.pts;
        item.innerHTML = `<strong>${a.terme}</strong>`;
        const s = document.createElement('select');
        s.innerHTML = '<option value="">-- Choisir --</option>';
        defs.forEach(d => { const o = document.createElement('option'); o.value = d; o.textContent = d; s.appendChild(o); });
        item.appendChild(s); col.appendChild(item);
    });
    div.appendChild(col); c.appendChild(div);
}

function renderTrousLibre(ex, c) {
    const div = document.createElement('div'); div.className = 'texte-trous';
    const els = ex.trous.map((t, i) => `<input type="text" class="trou-input" data-ti="${i}" data-pts="${t.pts}" placeholder="...">`);
    div.innerHTML = remplacerTrous(ex.texte, els);
    c.appendChild(div);
}

function renderTrousListeUnique(ex, c) {
    const div = document.createElement('div'); div.className = 'texte-trous';
    const els = ex.trous.map((t, i) => {
        let o = '<option value="">--</option>';
        ex.listeCommune.forEach(l => { o += `<option value="${l}">${l}</option>`; });
        return `<select class="trou-select" data-ti="${i}" data-pts="${t.pts}">${o}</select>`;
    });
    div.innerHTML = remplacerTrous(ex.texte, els);
    c.appendChild(div);
}

function renderTrousListeVariable(ex, c) {
    const div = document.createElement('div'); div.className = 'texte-trous';
    const els = ex.trous.map((t, i) => {
        let o = '<option value="">--</option>';
        t.liste.forEach(l => { o += `<option value="${l}">${l}</option>`; });
        return `<select class="trou-select" data-ti="${i}" data-pts="${t.pts}">${o}</select>`;
    });
    div.innerHTML = remplacerTrous(ex.texte, els);
    c.appendChild(div);
}

function validerEtSuivantEval() {
    clearInterval(timerEval);
    const ex = evalQuestions[evalIndex];
    let pts = 0;
    const det = { titre: ex.titre, niveau: ex.niveau, questions: [] };

    if (ex.type === 'tableau-menu') {
        $$('#eval-content select').forEach(s => {
            const qd = ex.questions.find(q => q.id === s.dataset.qid);
            const p = parseFloat(s.dataset.pts);
            const ok = s.options[s.selectedIndex]?.dataset.correct === 'true';
            if (ok) pts += p;
            det.questions.push({ enonce: qd.enonce, reponseEleve: s.value || 'Aucune', bonneReponse: qd.options.find(o => o.correct).texte, correct: ok, pts: ok ? p : 0 });
        });
    }
    else if (ex.type === 'choix-unique') {
        const sel = document.querySelector('input[name="cu"]:checked');
        if (sel) {
            const o = ex.options[parseInt(sel.value)];
            if (o.correct) pts += o.pts;
            det.questions.push({ enonce: ex.enonce, reponseEleve: o.texte, bonneReponse: ex.options.find(x => x.correct).texte, correct: o.correct, pts: o.correct ? o.pts : 0 });
        }
    }
    else if (ex.type === 'choix-multiple') {
        $$('#eval-content input[type="checkbox"]').forEach(cb => {
            const o = ex.options[parseInt(cb.value)];
            const ok = cb.checked === o.correct;
            if (ok && o.correct) pts += o.pts;
            det.questions.push({ enonce: o.texte, reponseEleve: cb.checked ? 'Coché' : 'Non', bonneReponse: o.correct ? 'Cocher' : 'Ne pas cocher', correct: ok, pts: (ok && o.correct) ? o.pts : 0 });
        });
    }
    else if (ex.type === 'valeur-numerique') {
        const v = $('#vn-input').value.replace(/\s/g, '').replace(',', '.');
        const ok = ex.bonnesReponses.some(r => r.replace(/\s/g, '').replace(',', '.') === v);
        if (ok) pts += ex.pts;
        det.questions.push({ enonce: ex.enonce, reponseEleve: $('#vn-input').value || 'Aucune', bonneReponse: ex.bonnesReponses[0], correct: ok, pts: ok ? ex.pts : 0 });
    }
    else if (ex.type === 'reponse-saisie') {
        const v = norm($('#rs-input').value, ex.ignorerCasse, ex.ignorerAccents);
        const ok = ex.bonnesReponses.some(r => norm(r, ex.ignorerCasse, ex.ignorerAccents) === v);
        if (ok) pts += ex.pts;
        det.questions.push({ enonce: ex.enonce, reponseEleve: $('#rs-input').value || 'Aucune', bonneReponse: ex.bonnesReponses[0], correct: ok, pts: ok ? ex.pts : 0 });
    }
    else if (ex.type === 'association') {
        $$('#eval-content .association-item').forEach(item => {
            const p = parseFloat(item.dataset.pts);
            const v = item.querySelector('select').value;
            const ad = ex.associations.find(a => a.terme === item.dataset.terme);
            const ok = v === ad.definition;
            if (ok) pts += p;
            det.questions.push({ enonce: item.dataset.terme, reponseEleve: v || 'Aucune', bonneReponse: ad.definition, correct: ok, pts: ok ? p : 0 });
        });
    }
    else if (ex.type === 'texte-trous-libre') {
        $$('#eval-content input[data-ti]').forEach(inp => {
            const i = parseInt(inp.dataset.ti);
            const p = parseFloat(inp.dataset.pts);
            const v = norm(inp.value, true, false);
            const ok = ex.trous[i].bonnesReponses.some(r => norm(r, true, false) === v);
            if (ok) pts += p;
            det.questions.push({ enonce: `Trou ${i+1}`, reponseEleve: inp.value || 'Aucune', bonneReponse: ex.trous[i].bonnesReponses[0], correct: ok, pts: ok ? p : 0 });
        });
    }
    else if (ex.type === 'texte-trous-liste-unique' || ex.type === 'texte-trous-liste-variable') {
        $$('#eval-content select[data-ti]').forEach(sel => {
            const i = parseInt(sel.dataset.ti);
            const p = parseFloat(sel.dataset.pts);
            const ok = sel.value === ex.trous[i].bonneReponse;
            if (ok) pts += p;
            det.questions.push({ enonce: `Trou ${i+1}`, reponseEleve: sel.value || 'Aucune', bonneReponse: ex.trous[i].bonneReponse, correct: ok, pts: ok ? p : 0 });
        });
    }

    scoreEval += pts;
    det.points = Math.round(pts * 10) / 10;
    let tp = 0;
    if (ex.type === 'tableau-menu') tp = ex.questions.reduce((s, q) => s + q.pts, 0);
    else if (ex.type === 'association') tp = ex.associations.reduce((s, a) => s + a.pts, 0);
    else if (ex.trous) tp = ex.trous.reduce((s, t) => s + t.pts, 0);
    else if (ex.pts) tp = ex.pts;
    else if (ex.options) tp = ex.options.reduce((s, o) => s + (o.pts || 0), 0);
    det.totalPossible = tp;
    detailsEval.push(det);
    evalIndex++;
    afficherExerciceEval();
}

function terminerEval() {
    $('#section-eval').classList.add('hidden');
    afficherResultats();
}

function afficherResultats() {
    const z = $('#pdf-report-area'); z.classList.remove('hidden');
    const tq = quizQuestions.length, te = 40, tot = scoreQuiz + scoreEval;
    const m = tot >= 48 ? '🏆 Excellent' : tot >= 40 ? '👍 Très bien' : tot >= 30 ? '✅ Bien' : tot >= 20 ? '📚 À renforcer' : '⚠️ À retravailler';
    let h = `<div class="score-final">🎯 Score total : ${tot.toFixed(1)} / ${tq+te} pts<br><small>Quiz : ${scoreQuiz}/${tq} | Éval : ${scoreEval.toFixed(1)}/${te}</small><br><small>${m}</small></div>`;
    h += '<div class="resultat-section"><h3>📋 Quiz (15 questions)</h3>';
    detailsQuiz.forEach((d, i) => {
        h += `<div class="detail-exercice ${d.correct?'':'erreur'}"><strong>Q${i+1}.</strong> ${d.question}<br>${d.correct?'✅ Bonne réponse':`❌ "${d.reponseEleve}" → "${d.bonneReponse}"`}</div>`;
    });
    h += '</div><div class="resultat-section"><h3>📝 Évaluation (40 questions)</h3>';
    detailsEval.forEach(d => {
        const nb = d.questions.filter(q => q.correct).length;
        h += `<div class="detail-exercice ${nb===d.questions.length?'':'erreur'}"><strong>${d.titre}</strong> — ${d.points}/${d.totalPossible} pts (${nb}/${d.questions.length})<br>`;
        d.questions.forEach((q, i) => {
            h += `<div class="detail-question ${q.correct?'bonne':'mauvaise'}">${q.correct?'✅':'❌'} ${q.enonce}<br>${q.correct?`<em>${q.reponseEleve}</em>`:`<em>"${q.reponseEleve}" → "${q.bonneReponse}"</em>`}</div>`;
        });
        h += '</div>';
    });
    h += '</div>';
    $('#resultats-detail').innerHTML = h;
    z.scrollIntoView({ behavior: 'smooth' });
}

function genererPDFResultats() {
    const el = $('#pdf-report-area');
    el.classList.remove('hidden'); el.style.display = 'block';
    setTimeout(() => {
        html2pdf().set({
            margin: [10,10,10,10],
            filename: `Rapport_${new Date().toISOString().slice(0,10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 960 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all','css','legacy'] }
        }).from(el).save();
    }, 100);
}

$('#btn-telecharger-pdf').addEventListener('click', genererPDFResultats);
$('#btn-recommencer').addEventListener('click', () => location.reload());
document.addEventListener('DOMContentLoaded', chargerDonnees);
