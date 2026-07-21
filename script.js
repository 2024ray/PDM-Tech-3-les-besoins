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

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function formatTemps(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function normaliserTexte(texte, ignorerCasse, ignorerAccents) {
    let t = texte.trim().toLowerCase();
    if (ignorerAccents) {
        t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    return t;
}

// ========== FONCTION UTILITAIRE POUR REMPLACER LES TROUS ==========
function remplacerTrous(texte, elements) {
    const parties = texte.split('{{}}');
    let resultat = parties[0];
    for (let i = 0; i < elements.length; i++) {
        resultat += elements[i] + (parties[i + 1] || '');
    }
    return resultat;
}

async function chargerDonnees() {
    try {
        const res = await fetch('questions.json?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
    } catch (e) {
        try {
            data = JSON.parse($('#questions-data-inline').textContent);
        } catch (e2) {
            document.body.innerHTML = '<div style="max-width:600px;margin:4rem auto;padding:2rem;background:#fee2e2;border:2px solid #ef4444;border-radius:12px;"><h2>⚠️ Erreur</h2><p>Impossible de charger les questions.</p><button onclick="location.reload()">Réessayer</button></div>';
            return;
        }
    }
    initialiserCours();
    preparerQuiz();
    preparerEval();
}

function initialiserCours() {
    const conteneur = $('#contenu-cours');
    let html = `<div class="intro"><strong>🎯 Introduction :</strong> ${data.cours.introduction}</div>`;
    data.cours.sections.forEach(s => {
        html += `<div class="section-cours"><h3>${s.titre}</h3><p>${s.contenu}</p></div>`;
    });
    conteneur.innerHTML = html;
}

function preparerQuiz() {
    quizQuestions = shuffle(data.quizComprehension).map(q => ({ ...q, options: shuffle(q.options) }));
    $('#btn-commencer-quiz').addEventListener('click', demarrerQuiz);
}

function demarrerQuiz() {
    $('#section-cours').classList.add('hidden');
    $('#section-quiz').classList.remove('hidden');
    quizIndex = 0;
    scoreQuiz = 0;
    detailsQuiz = [];
    tempsQuizRestant = 20 * 60;
    afficherQuestionQuiz();
    lancerTimerQuiz();
}

function afficherQuestionQuiz() {
    if (quizIndex >= quizQuestions.length) { terminerQuiz(); return; }
    const q = quizQuestions[quizIndex];
    $('#quiz-progress').textContent = `Question ${quizIndex + 1} / ${quizQuestions.length}`;
    $('#quiz-progress-bar').style.width = `${(quizIndex / quizQuestions.length) * 100}%`;
    $('#quiz-question').innerHTML = `<strong>Q${quizIndex + 1}.</strong> ${q.question}`;
    
    const optDiv = $('#quiz-options');
    optDiv.innerHTML = '';
    q.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `<input type="radio" name="quiz-opt" id="qopt${i}" value="${i}"><label for="qopt${i}">${opt.texte}</label>`;
        div.addEventListener('click', () => {
            $$('#quiz-options .option-item').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            div.querySelector('input').checked = true;
        });
        optDiv.appendChild(div);
    });
    $('#btn-suivant-quiz').classList.remove('hidden');
}

function lancerTimerQuiz() {
    clearInterval(timerQuiz);
    mettreAJourTimerQuiz();
    timerQuiz = setInterval(() => {
        tempsQuizRestant--;
        mettreAJourTimerQuiz();
        if (tempsQuizRestant <= 0) { clearInterval(timerQuiz); terminerQuiz(); }
    }, 1000);
}

function mettreAJourTimerQuiz() {
    const t = $('#quiz-timer');
    t.textContent = `⏱️ ${formatTemps(tempsQuizRestant)}`;
    if (tempsQuizRestant < 60) t.classList.add('warning');
    else t.classList.remove('warning');
}

$('#btn-suivant-quiz').addEventListener('click', () => {
    const sel = document.querySelector('input[name="quiz-opt"]:checked');
    const q = quizQuestions[quizIndex];
    let bonne = false;
    if (sel) {
        const idx = parseInt(sel.value);
        bonne = q.options[idx].correct;
        if (bonne) scoreQuiz++;
    }
    detailsQuiz.push({
        question: q.question,
        reponseEleve: sel ? q.options[parseInt(sel.value)].texte : 'Aucune réponse',
        bonneReponse: q.options.find(o => o.correct).texte,
        correct: bonne
    });
    quizIndex++;
    afficherQuestionQuiz();
});

function terminerQuiz() {
    clearInterval(timerQuiz);
    $('#section-quiz').classList.add('hidden');
    $('#section-eval').classList.remove('hidden');
    evalIndex = 0;
    scoreEval = 0;
    detailsEval = [];
    afficherExerciceEval();
}

function preparerEval() {
    evalQuestions = shuffle(data.evaluation);
    $('#btn-suivant-eval').addEventListener('click', () => validerEtSuivantEval());
}

function afficherExerciceEval() {
    if (evalIndex >= evalQuestions.length) { terminerEval(); return; }
    const ex = evalQuestions[evalIndex];
    $('#eval-progress').textContent = `Exercice ${evalIndex + 1} / ${evalQuestions.length}`;
    $('#eval-progress-bar').style.width = `${(evalIndex / evalQuestions.length) * 100}%`;
    
    let badge = '';
    if (ex.niveau === 'Facile') badge = '<span class="badge badge-facile">Facile</span>';
    else if (ex.niveau === 'Moyen') badge = '<span class="badge badge-moyen">Moyen</span>';
    else badge = '<span class="badge badge-avance">Avancé</span>';
    
    $('#eval-question').innerHTML = `<strong>${ex.titre}</strong> ${badge}<br><br>${ex.enonce}`;
    
    const content = $('#eval-content');
    content.innerHTML = '';
    
    if (ex.type === 'tableau-menu') renderTableauMenu(ex, content);
    else if (ex.type === 'choix-unique') renderChoixUnique(ex, content);
    else if (ex.type === 'choix-multiple') renderChoixMultiple(ex, content);
    else if (ex.type === 'valeur-numerique') renderValeurNumerique(ex, content);
    else if (ex.type === 'reponse-saisie') renderReponseSaisie(ex, content);
    else if (ex.type === 'association') renderAssociation(ex, content);
    else if (ex.type === 'texte-trous-libre') renderTexteTrousLibre(ex, content);
    else if (ex.type === 'texte-trous-liste-unique') renderTexteTrousListeUnique(ex, content);
    else if (ex.type === 'texte-trous-liste-variable') renderTexteTrousListeVariable(ex, content);
    
    lancerTimerEval();
}

function lancerTimerEval() {
    clearInterval(timerEval);
    let tempsRestant = 90;
    const t = $('#eval-timer');
    t.textContent = `⏱️ ${formatTemps(tempsRestant)}`;
    t.classList.remove('warning');
    
    timerEval = setInterval(() => {
        tempsRestant--;
        t.textContent = `⏱️ ${formatTemps(tempsRestant)}`;
        if (tempsRestant < 10) t.classList.add('warning');
        if (tempsRestant <= 0) { clearInterval(timerEval); validerEtSuivantEval(); }
    }, 1000);
}

function renderTableauMenu(ex, container) {
    const table = document.createElement('table');
    table.className = 'tableau-menu';
    table.innerHTML = `<thead><tr><th>N°</th><th>Énoncé</th><th>Réponse</th></tr></thead>`;
    
    const tbody = document.createElement('tbody');
    shuffle([...ex.questions]).forEach((q, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="num">${i+1}</td><td>${q.enonce}</td><td></td>`;
        const select = document.createElement('select');
        select.dataset.questionId = q.id;
        select.dataset.pts = q.pts;
        select.innerHTML = '<option value="">-- Choisir --</option>';
        shuffle([...q.options]).forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.texte;
            option.dataset.correct = opt.correct;
            option.textContent = opt.texte;
            select.appendChild(option);
        });
        tr.cells[2].appendChild(select);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

function renderChoixUnique(ex, container) {
    shuffle([...ex.options]).forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `<input type="radio" name="choix-unique" id="cu${i}" value="${i}"><label for="cu${i}">${opt.texte}</label>`;
        div.addEventListener('click', () => {
            $$('#eval-content .option-item').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            div.querySelector('input').checked = true;
        });
        container.appendChild(div);
    });
}

function renderChoixMultiple(ex, container) {
    shuffle([...ex.options]).forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `<input type="checkbox" id="cm${i}" value="${i}"><label for="cm${i}">${opt.texte}</label>`;
        div.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                const cb = div.querySelector('input');
                cb.checked = !cb.checked;
            }
            div.classList.toggle('selected', div.querySelector('input').checked);
        });
        container.appendChild(div);
    });
}

function renderValeurNumerique(ex, container) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'reponse-saisie-input';
    input.placeholder = 'Saisis ta réponse numérique...';
    input.id = 'valeur-numerique-input';
    container.appendChild(input);
}

function renderReponseSaisie(ex, container) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'reponse-saisie-input';
    input.placeholder = 'Saisis ta réponse...';
    input.id = 'reponse-saisie-input';
    container.appendChild(input);
}

function renderAssociation(ex, container) {
    const div = document.createElement('div');
    div.className = 'association-container';
    
    const colTermes = document.createElement('div');
    colTermes.className = 'association-colonne';
    colTermes.innerHTML = '<h4>Concepts</h4>';
    shuffle([...ex.associations]).forEach(asso => {
        const item = document.createElement('div');
        item.className = 'association-item';
        item.dataset.terme = asso.terme;
        item.dataset.pts = asso.pts;
        item.innerHTML = `<strong>${asso.terme}</strong>`;
        const select = document.createElement('select');
        select.innerHTML = '<option value="">-- Choisir --</option>';
        shuffle([...ex.associations]).map(a => a.definition).forEach(def => {
            const option = document.createElement('option');
            option.value = def;
            option.textContent = def;
            select.appendChild(option);
        });
        item.appendChild(select);
        colTermes.appendChild(item);
    });
    
    div.appendChild(colTermes);
    container.appendChild(div);
}

// ========== CORRECTION : TEXTES À TROUS ==========
function renderTexteTrousLibre(ex, container) {
    const div = document.createElement('div');
    div.className = 'texte-trous';
    
    // Création des inputs HTML
    const inputsHTML = ex.trous.map((trou, i) => 
        `<input type="text" data-trou-index="${i}" data-pts="${trou.pts}" placeholder="..." class="trou-input">`
    );
    
    // Remplacement de tous les {{}} dans l'ordre
    div.innerHTML = remplacerTrous(ex.texte, inputsHTML);
    container.appendChild(div);
}

function renderTexteTrousListeUnique(ex, container) {
    const div = document.createElement('div');
    div.className = 'texte-trous';
    
    const selectsHTML = ex.trous.map((trou, i) => {
        let options = '<option value="">--</option>';
        ex.listeCommune.forEach(item => {
            options += `<option value="${item}">${item}</option>`;
        });
        return `<select data-trou-index="${i}" data-pts="${trou.pts}" class="trou-select">${options}</select>`;
    });
    
    div.innerHTML = remplacerTrous(ex.texte, selectsHTML);
    container.appendChild(div);
}

function renderTexteTrousListeVariable(ex, container) {
    const div = document.createElement('div');
    div.className = 'texte-trous';
    
    const selectsHTML = ex.trous.map((trou, i) => {
        let options = '<option value="">--</option>';
        trou.liste.forEach(item => {
            options += `<option value="${item}">${item}</option>`;
        });
        return `<select data-trou-index="${i}" data-pts="${trou.pts}" class="trou-select">${options}</select>`;
    });
    
    div.innerHTML = remplacerTrous(ex.texte, selectsHTML);
    container.appendChild(div);
}

function validerEtSuivantEval() {
    clearInterval(timerEval);
    const ex = evalQuestions[evalIndex];
    let pts = 0;
    const details = { titre: ex.titre, niveau: ex.niveau, questions: [] };
    
    if (ex.type === 'tableau-menu') {
        const selects = $$('#eval-content select');
        selects.forEach(select => {
            const qId = select.dataset.questionId;
            const qPts = parseFloat(select.dataset.pts);
            const selectedOption = select.options[select.selectedIndex];
            const correct = selectedOption && selectedOption.dataset.correct === 'true';
            if (correct) pts += qPts;
            
            const questionData = ex.questions.find(q => q.id === qId);
            details.questions.push({
                enonce: questionData.enonce,
                reponseEleve: select.value || 'Aucune',
                bonneReponse: questionData.options.find(o => o.correct).texte,
                correct: correct,
                pts: correct ? qPts : 0
            });
        });
    }
    else if (ex.type === 'choix-unique') {
        const sel = document.querySelector('input[name="choix-unique"]:checked');
        if (sel) {
            const idx = parseInt(sel.value);
            const opt = ex.options[idx];
            if (opt.correct) pts += opt.pts;
            details.questions.push({
                enonce: ex.enonce,
                reponseEleve: opt.texte,
                bonneReponse: ex.options.find(o => o.correct).texte,
                correct: opt.correct,
                pts: opt.correct ? opt.pts : 0
            });
        }
    }
    else if (ex.type === 'choix-multiple') {
        const checkboxes = $$('#eval-content input[type="checkbox"]');
        checkboxes.forEach((cb) => {
            const idx = parseInt(cb.value);
            const opt = ex.options[idx];
            const coche = cb.checked;
            if (coche === opt.correct && opt.correct) pts += opt.pts;
            details.questions.push({
                enonce: opt.texte,
                reponseEleve: coche ? 'Coché' : 'Non coché',
                bonneReponse: opt.correct ? 'Devait être coché' : 'Ne devait pas être coché',
                correct: coche === opt.correct,
                pts: (coche === opt.correct && opt.correct) ? opt.pts : 0
            });
        });
    }
    else if (ex.type === 'valeur-numerique') {
        const input = $('#valeur-numerique-input');
        const val = input.value.replace(/\s/g, '').replace(',', '.');
        const correct = ex.bonnesReponses.some(r => r.replace(/\s/g, '').replace(',', '.') === val);
        if (correct) pts += ex.pts;
        details.questions.push({
            enonce: ex.enonce,
            reponseEleve: input.value || 'Aucune',
            bonneReponse: ex.bonnesReponses[0],
            correct: correct,
            pts: correct ? ex.pts : 0
        });
    }
    else if (ex.type === 'reponse-saisie') {
        const input = $('#reponse-saisie-input');
        const val = normaliserTexte(input.value, ex.ignorerCasse, ex.ignorerAccents);
        const correct = ex.bonnesReponses.some(r => normaliserTexte(r, ex.ignorerCasse, ex.ignorerAccents) === val);
        if (correct) pts += ex.pts;
        details.questions.push({
            enonce: ex.enonce,
            reponseEleve: input.value || 'Aucune',
            bonneReponse: ex.bonnesReponses[0],
            correct: correct,
            pts: correct ? ex.pts : 0
        });
    }
    else if (ex.type === 'association') {
        const items = $$('#eval-content .association-item');
        items.forEach(item => {
            const terme = item.dataset.terme;
            const ptsAsso = parseFloat(item.dataset.pts);
            const select = item.querySelector('select');
            const valeur = select.value;
            const assoData = ex.associations.find(a => a.terme === terme);
            const correct = valeur === assoData.definition;
            if (correct) pts += ptsAsso;
            details.questions.push({
                enonce: terme,
                reponseEleve: valeur || 'Aucune',
                bonneReponse: assoData.definition,
                correct: correct,
                pts: correct ? ptsAsso : 0
            });
        });
    }
    // ========== CORRECTION : VALIDATION TEXTES À TROUS ==========
    else if (ex.type === 'texte-trous-libre') {
        const inputs = $$('#eval-content input[data-trou-index]');
        inputs.forEach(input => {
            const idx = parseInt(input.dataset.trouIndex);
            const ptsTrou = parseFloat(input.dataset.pts);
            const trou = ex.trous[idx];
            const val = normaliserTexte(input.value, true, false);
            const correct = trou.bonnesReponses.some(r => normaliserTexte(r, true, false) === val);
            if (correct) pts += ptsTrou;
            details.questions.push({
                enonce: `Trou ${idx+1}`,
                reponseEleve: input.value || 'Aucune',
                bonneReponse: trou.bonnesReponses[0],
                correct: correct,
                pts: correct ? ptsTrou : 0
            });
        });
    }
    else if (ex.type === 'texte-trous-liste-unique' || ex.type === 'texte-trous-liste-variable') {
        const selects = $$('#eval-content select[data-trou-index]');
        selects.forEach(select => {
            const idx = parseInt(select.dataset.trouIndex);
            const ptsTrou = parseFloat(select.dataset.pts);
            const trou = ex.trous[idx];
            const val = select.value;
            const correct = val === trou.bonneReponse;
            if (correct) pts += ptsTrou;
            details.questions.push({
                enonce: `Trou ${idx+1}`,
                reponseEleve: val || 'Aucune',
                bonneReponse: trou.bonneReponse,
                correct: correct,
                pts: correct ? ptsTrou : 0
            });
        });
    }
    
    scoreEval += pts;
    details.points = Math.round(pts * 10) / 10;
    
    // Calcul du total possible selon le type
    let totalPossible = 0;
    if (ex.type === 'tableau-menu') {
        totalPossible = ex.questions.reduce((s, q) => s + q.pts, 0);
    } else if (ex.type === 'association') {
        totalPossible = ex.associations.reduce((s, a) => s + a.pts, 0);
    } else if (ex.type === 'texte-trous-libre' || ex.type === 'texte-trous-liste-unique' || ex.type === 'texte-trous-liste-variable') {
        totalPossible = ex.trous.reduce((s, t) => s + t.pts, 0);
    } else if (ex.pts) {
        totalPossible = ex.pts;
    } else if (ex.options) {
        totalPossible = ex.options.reduce((s, o) => s + (o.pts || 0), 0);
    }
    details.totalPossible = totalPossible;
    detailsEval.push(details);
    
    evalIndex++;
    afficherExerciceEval();
}

function terminerEval() {
    $('#section-eval').classList.add('hidden');
    afficherResultats();
}

function afficherResultats() {
    const zone = $('#pdf-report-area');
    zone.classList.remove('hidden');
    
    const totalQuiz = quizQuestions.length;
    const totalEval = 40;
    const total = scoreQuiz + scoreEval;
    const mention = total >= 36 ? '🏆 Excellent' : total >= 28 ? '👍 Très bien' : total >= 20 ? '✅ Bien' : total >= 12 ? '📚 À renforcer' : '⚠️ À retravailler';
    
    let html = `
        <div class="score-final">
            🎯 Score total : ${total.toFixed(1)} / ${totalQuiz + totalEval} pts<br>
            <small>Quiz : ${scoreQuiz}/${totalQuiz} | Évaluation : ${scoreEval.toFixed(1)}/${totalEval}</small><br>
            <small>${mention}</small>
        </div>
        <div class="resultat-section">
            <h3>📋 Détail du Quiz</h3>`;
    detailsQuiz.forEach((d, i) => {
        html += `<div class="detail-exercice ${d.correct ? '' : 'erreur'}">
            <strong>Q${i+1}.</strong> ${d.question}<br>
            ${d.correct ? '✅ Bonne réponse' : `❌ Tu as répondu : "${d.reponseEleve}" — Attendu : "${d.bonneReponse}"`}
        </div>`;
    });
    html += `</div><div class="resultat-section"><h3>📝 Détail de l'évaluation</h3>`;
    detailsEval.forEach(d => {
        const nbBonnes = d.questions.filter(q => q.correct).length;
        const total = d.questions.length;
        const ok = nbBonnes === total;
        html += `<div class="detail-exercice ${ok ? '' : 'erreur'}">
            <strong>${d.titre}</strong> — ${d.points} / ${d.totalPossible} pts (${nbBonnes}/${total})<br>`;
        d.questions.forEach((q, i) => {
            html += `<div class="detail-question ${q.correct ? 'bonne' : 'mauvaise'}">
                ${q.correct ? '✅' : '❌'} ${q.enonce}<br>
                ${q.correct ? `<em>Ta réponse : ${q.reponseEleve}</em>` : `<em>Tu as répondu : "${q.reponseEleve}" — Attendu : "${q.bonneReponse}"</em>`}
            </div>`;
        });
        html += `</div>`;
    });
    html += `</div>`;
    
    $('#resultats-detail').innerHTML = html;
    zone.scrollIntoView({ behavior: 'smooth' });
}

function genererPDFResultats() {
    const element = $('#pdf-report-area');
    element.classList.remove('hidden');
    element.style.display = 'block';
    
    setTimeout(() => {
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Rapport_Technologie_${new Date().toISOString().slice(0,10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 960 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save();
    }, 100);
}

$('#btn-telecharger-pdf').addEventListener('click', genererPDFResultats);
$('#btn-recommencer').addEventListener('click', () => location.reload());

document.addEventListener('DOMContentLoaded', chargerDonnees);
