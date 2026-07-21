// ============ VARIABLES GLOBALES ============
let data = null;
let quizQuestions = [];
let evalQuestions = [];
let quizIndex = 0;
let evalIndex = 0;
let scoreQuiz = 0;
let scoreEval = 0;
let detailsQuiz = [];
let detailsEval = [];
let reponsesEval = [];
let timerQuiz = null;
let timerEval = null;
let tempsQuizRestant = 20 * 60; // 20 minutes

// ============ UTILITAIRES ============
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

// Fisher-Yates shuffle
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

// ============ CHARGEMENT DES DONNÉES ============
async function chargerDonnees() {
    // 1) Essayer de charger le JSON externe
    try {
        const res = await fetch('questions.json?t=' + Date.now(), {
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
        console.log('✅ JSON chargé depuis questions.json');
    } catch (e) {
        // 2) Fallback : JSON inline dans index.html
        console.warn('⚠️ Fetch échoué, utilisation du fallback inline :', e.message);
        try {
            const inline = document.getElementById('questions-data-inline').textContent;
            data = JSON.parse(inline);
            console.log('✅ JSON chargé depuis le fallback inline');
        } catch (e2) {
            console.error('❌ Erreur fatale : impossible de charger les données', e2);
            afficherErreurFatale();
            return;
        }
    }
    
    initialiserCours();
    preparerQuiz();
    preparerEval();
}

function afficherErreurFatale() {
    document.body.innerHTML = `
        <div style="max-width:600px;margin:4rem auto;padding:2rem;background:#fee2e2;border:2px solid #ef4444;border-radius:12px;font-family:sans-serif;">
            <h2 style="color:#991b1b;">⚠️ Erreur critique</h2>
            <p>Impossible de charger les questions. Vérifie que <code>questions.json</code> est présent dans le même dossier.</p>
            <button onclick="location.reload()" style="margin-top:1rem;padding:0.75rem 1.5rem;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;">🔄 Réessayer</button>
        </div>
    `;
}

// ============ COURS ============
function initialiserCours() {
    const conteneur = $('#contenu-cours');
    let html = `<div class="intro"><strong>🎯 Introduction :</strong> ${data.cours.introduction}</div>`;
    data.cours.sections.forEach(s => {
        html += `<div class="section-cours"><h3>${s.titre}</h3><p>${s.contenu}</p></div>`;
    });
    conteneur.innerHTML = html;
}

// ============ QUIZ ============
function preparerQuiz() {
    quizQuestions = shuffle(data.quizComprehension).map(q => ({
        ...q,
        options: shuffle(q.options)
    }));
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
    if (quizIndex >= quizQuestions.length) {
        terminerQuiz();
        return;
    }
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
        if (tempsQuizRestant <= 0) {
            clearInterval(timerQuiz);
            terminerQuiz();
        }
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
    reponsesEval = [];
    afficherExerciceEval();
}

// ============ ÉVALUATION ============
function preparerEval() {
    evalQuestions = shuffle(data.evaluation);
    $('#btn-suivant-eval').addEventListener('click', () => validerEtSuivantEval(false));
}

function afficherExerciceEval() {
    if (evalIndex >= evalQuestions.length) {
        terminerEval();
        return;
    }
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
    
    if (ex.type === 'qcm') renderQCM(ex, content);
    else if (ex.type === 'association') renderAssociation(ex, content);
    else if (ex.type === 'redaction') renderRedaction(ex, content);
    else if (ex.type === 'tableur') renderTableur(ex, content);
    
    lancerTimerEval();
}

function lancerTimerEval() {
    clearInterval(timerEval);
    let tempsRestant = 60;
    const t = $('#eval-timer');
    t.textContent = `⏱️ ${formatTemps(tempsRestant)}`;
    t.classList.remove('warning');
    
    timerEval = setInterval(() => {
        tempsRestant--;
        t.textContent = `⏱️ ${formatTemps(tempsRestant)}`;
        if (tempsRestant < 10) t.classList.add('warning');
        if (tempsRestant <= 0) {
            clearInterval(timerEval);
            validerEtSuivantEval(true);
        }
    }, 1000);
}

function renderQCM(ex, container) {
    ex.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `<input type="checkbox" id="qcm${i}" value="${i}"><label for="qcm${i}">${opt.texte} <em>(${opt.pts} pt${opt.pts>1?'s':''})</em></label>`;
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

function renderAssociation(ex, container) {
    ex.associations.forEach((asso, i) => {
        const div = document.createElement('div');
        div.className = 'association-group';
        const opts = shuffle([...asso.bonnesDefinitions, ...asso.mauvaises]);
        div.innerHTML = `<h4>${asso.terme} <em>(${asso.pts} pts)</em></h4>`;
        opts.forEach(def => {
            const lab = document.createElement('label');
            lab.style.display = 'block';
            lab.style.margin = '0.3rem 0';
            const correct = asso.bonnesDefinitions.includes(def);
            lab.innerHTML = `<input type="checkbox" data-term="${i}" data-def="${def}" data-correct="${correct}"> ${def}`;
            div.appendChild(lab);
        });
        container.appendChild(div);
    });
}

function renderRedaction(ex, container) {
    if (ex.champs) {
        ex.champs.forEach((c, i) => {
            const div = document.createElement('div');
            div.className = 'champ-reponse';
            div.innerHTML = `<label>${c.label} <em>(${c.pts} pts)</em></label><input type="text" data-champ="${i}" placeholder="Ta réponse...">`;
            container.appendChild(div);
        });
    } else {
        const div = document.createElement('div');
        div.className = 'champ-reponse';
        div.innerHTML = `<label>Rédige ta réponse (${ex.pts} pts) :</label><textarea id="redaction-longue" placeholder="Écris ici ta réponse complète..."></textarea>`;
        container.appendChild(div);
    }
}

function renderTableur(ex, container) {
    const table = document.createElement('table');
    table.className = 'tableur-custom';
    let thead = '<tr>';
    ex.grille.entetes.forEach(e => thead += `<th>${e}</th>`);
    thead += '</tr>';
    table.innerHTML = thead;
    
    ex.grille.lignes.forEach(ligne => {
        const tr = document.createElement('tr');
        ligne.forEach((cell, j) => {
            const td = document.createElement('td');
            if (j === 0) {
                td.className = 'entete-ligne';
                td.textContent = cell;
            } else if (cell === '') {
                const input = document.createElement('input');
                input.type = 'text';
                input.dataset.cellule = `${ex.grille.entetes[j]}${ligne[0]}`;
                td.appendChild(input);
            } else {
                td.textContent = cell;
            }
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
    container.appendChild(table);
}

function validerEtSuivantEval(auto = false) {
    clearInterval(timerEval);
    const ex = evalQuestions[evalIndex];
    let pts = 0;
    const details = { titre: ex.titre, niveau: ex.niveau, erreurs: [], reussites: [] };
    
    if (ex.type === 'qcm') {
        ex.options.forEach((opt, i) => {
            const cb = document.getElementById(`qcm${i}`);
            const coche = cb && cb.checked;
            if (coche === opt.correct) {
                if (opt.correct) { pts += opt.pts; details.reussites.push(opt.texte); }
            } else {
                if (opt.correct) details.erreurs.push(`Il fallait cocher : "${opt.texte}"`);
                else if (coche) details.erreurs.push(`Il ne fallait PAS cocher : "${opt.texte}"`);
            }
        });
    }
    else if (ex.type === 'association') {
        ex.associations.forEach((asso, i) => {
            const checks = $$(`input[data-term="${i}"]`);
            let ptsAsso = 0;
            const totalCases = checks.length;
            checks.forEach(cb => {
                const coche = cb.checked;
                const correct = cb.dataset.correct === 'true';
                if (coche === correct) ptsAsso += (asso.pts / totalCases);
                else details.erreurs.push(`${asso.terme} : mauvaise association sur "${cb.dataset.def}"`);
            });
            pts += Math.round(ptsAsso * 10) / 10;
        });
    }
    else if (ex.type === 'redaction') {
        if (ex.champs) {
            ex.champs.forEach((c, i) => {
                const input = document.querySelector(`input[data-champ="${i}"]`);
                const val = (input ? input.value : '').toLowerCase();
                const trouve = c.motsCles.some(m => val.includes(m.toLowerCase()));
                if (trouve) { pts += c.pts; details.reussites.push(c.label); }
                else details.erreurs.push(`${c.label} : mots-clés attendus → ${c.motsCles.join(', ')}`);
            });
        } else {
            const ta = document.getElementById('redaction-longue');
            const val = (ta ? ta.value : '').toLowerCase();
            const nbMots = ex.motsCles.filter(m => val.includes(m.toLowerCase())).length;
            const ratio = nbMots / ex.motsCles.length;
            pts = Math.round(ratio * ex.pts * 10) / 10;
            if (ratio >= 0.5) details.reussites.push(`Analyse pertinente (${nbMots}/${ex.motsCles.length} mots-clés)`);
            else details.erreurs.push(`Mots-clés manquants : ${ex.motsCles.filter(m => !val.includes(m.toLowerCase())).join(', ')}`);
        }
    }
    else if (ex.type === 'tableur') {
        ex.reponses.forEach(r => {
            const input = document.querySelector(`input[data-cellule="${r.cellule}"]`);
            const val = (input ? input.value : '').trim().toUpperCase().replace(/\s/g,'');
            const trouve = r.motsCles.some(m => m.toUpperCase().replace(/\s/g,'') === val);
            if (trouve) { pts += r.pts; details.reussites.push(`Cellule ${r.cellule}`); }
            else details.erreurs.push(`Cellule ${r.cellule} : attendue → ${r.motsCles[0]}`);
        });
    }
    
    scoreEval += pts;
    details.points = pts;
    detailsEval.push(details);
    reponsesEval.push({ ex, pts });
    
    evalIndex++;
    afficherExerciceEval();
}

function terminerEval() {
    $('#section-eval').classList.add('hidden');
    afficherResultats();
}

// ============ RÉSULTATS ============
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
        const ok = d.erreurs.length === 0;
        html += `<div class="detail-exercice ${ok ? '' : 'erreur'}">
            <strong>${d.titre}</strong> — ${d.points} pts<br>
            ${ok ? '✅ ' + d.reussites.join(', ') : '❌ ' + d.erreurs.join(' | ')}
        </div>`;
    });
    html += `</div>`;
    
    $('#resultats-detail').innerHTML = html;
    zone.scrollIntoView({ behavior: 'smooth' });
}

// ============ GÉNÉRATION PDF ============
function genererPDFResultats() {
    const element = $('#pdf-report-area');
    element.classList.remove('hidden');
    element.style.display = 'block';
    
    setTimeout(() => {
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Rapport_Technologie_${new Date().toISOString().slice(0,10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                backgroundColor: '#ffffff',
                scrollY: 0,
                windowWidth: 960
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save()
            .then(() => console.log('✅ PDF généré'))
            .catch(err => {
                console.error('❌ Erreur PDF :', err);
                alert('Erreur lors de la génération du PDF.');
            });
    }, 100);
}

$('#btn-telecharger-pdf').addEventListener('click', genererPDFResultats);
$('#btn-recommencer').addEventListener('click', () => location.reload());

// ============ DÉMARRAGE ============
document.addEventListener('DOMContentLoaded', chargerDonnees);
