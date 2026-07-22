// Données intégrées
const dataInline = JSON.parse(document.getElementById('questions-data-inline').textContent);
let data = dataInline;

// Variables d'état
let quizIndex = 0;
let quizScore = 0;
let quizTimer = null;
let quizTempsRestant = 20 * 60; // 20 minutes en secondes
let quizReponses = [];

let evalIndex = 0;
let evalScoreTotal = 0;
let evalTimer = null;
let evalTempsRestant = 90; // 1 min 30 s par exercice
let evalReponses = [];

// Raccourci DOM
const $ = (s) => document.querySelector(s);

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    initialiserCours();
    attacherEvenements();
});

// ========== 1. COURS SYNTHÉTIQUE ==========
function initialiserCours() {
    let html = '';
    
    // Cadre Déroulement
    if (data.deroulement) {
        html += `
        <div class="deroulement-card">
            <h2>${data.deroulement.titre}</h2>
            <div class="steps-grid">`;
        data.deroulement.etapes.forEach(etape => {
            html += `<div class="step-item">${etape}</div>`;
        });
        html += `</div></div>`;
    }

    // Cadre Cours
    html += `<h2 class="section-title">📖 Cours synthétique</h2>`;
    html += `<div class="intro-box">🎯 <strong>Introduction :</strong> ${data.cours.introduction}</div>`;
    
    html += `<div class="cours-grid">`;
    data.cours.sections.forEach(s => {
        html += `
        <div class="cours-card">
            <h3>${s.titre}</h3>
            <p>${s.contenu}</p>
        </div>`;
    });
    html += `</div>`;

    $('#contenu-cours').innerHTML = html;
}

// ========== EVENEMENTS ==========
function attacherEvenements() {
    $('#btn-commencer-quiz').addEventListener('click', lancerQuiz);
    $('#btn-suivant-quiz').addEventListener('click', questionQuizSuivante);
    $('#btn-suivant-eval').addEventListener('click', validerExerciceEval);
    $('#btn-telecharger-pdf').addEventListener('click', genererPDF);
    $('#btn-recommencer').addEventListener('click', () => location.reload());
}

// ========== 2. QUIZ DE COMPRÉHENSION ==========
function lancerQuiz() {
    $('#section-cours').classList.add('hidden');
    $('#section-quiz').classList.remove('hidden');
    demarrerChronoQuiz();
    afficherQuestionQuiz();
}

function demarrerChronoQuiz() {
    updateTimerDisplay('#quiz-timer', quizTempsRestant);
    quizTimer = setInterval(() => {
        quizTempsRestant--;
        updateTimerDisplay('#quiz-timer', quizTempsRestant);
        if (quizTempsRestant <= 0) {
            clearInterval(quizTimer);
            terminerQuiz();
        }
    }, 1000);
}

function afficherQuestionQuiz() {
    const q = data.quizComprehension[quizIndex];
    $('#quiz-progress').textContent = `Question ${quizIndex + 1} / ${data.quizComprehension.length}`;
    $('#quiz-progress-bar').style.width = `${((quizIndex + 1) / data.quizComprehension.length) * 100}%`;
    $('#quiz-question').innerHTML = `<strong>Question ${quizIndex + 1} :</strong> ${q.question}`;
    
    let htmlOptions = '';
    q.options.forEach((opt, idx) => {
        htmlOptions += `
        <button class="option-btn" data-idx="${idx}">
            ${opt.texte}
        </button>`;
    });
    $('#quiz-options').innerHTML = htmlOptions;
    $('#btn-suivant-quiz').classList.add('hidden');

    document.querySelectorAll('#quiz-options .option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => selectionnerOptionQuiz(e, q));
    });
}

function selectionnerOptionQuiz(e, question) {
    document.querySelectorAll('#quiz-options .option-btn').forEach(b => b.classList.remove('selected'));
    e.target.classList.add('selected');
    
    const selectedIdx = parseInt(e.target.dataset.idx);
    const isCorrect = question.options[selectedIdx].correct;
    
    quizReponses[quizIndex] = {
        question: question.question,
        choix: question.options[selectedIdx].texte,
        correct: isCorrect,
        pts: isCorrect ? 1 : 0
    };

    $('#btn-suivant-quiz').classList.remove('hidden');
}

function questionQuizSuivante() {
    quizIndex++;
    if (quizIndex < data.quizComprehension.length) {
        afficherQuestionQuiz();
    } else {
        terminerQuiz();
    }
}

function terminerQuiz() {
    clearInterval(quizTimer);
    quizScore = quizReponses.reduce((acc, r) => acc + (r ? r.pts : 0), 0);
    lancerEvaluation();
}

// ========== 3. ÉVALUATION PRATIQUE ==========
function lancerEvaluation() {
    $('#section-quiz').classList.add('hidden');
    $('#section-eval').classList.remove('hidden');
    afficherExerciceEval();
}

function afficherExerciceEval() {
    const ex = data.evaluation[evalIndex];
    evalTempsRestant = 90;
    demarrerChronoEval();

    $('#eval-progress').textContent = `Exercice ${evalIndex + 1} / ${data.evaluation.length}`;
    $('#eval-progress-bar').style.width = `${((evalIndex + 1) / data.evaluation.length) * 100}%`;
    $('#eval-question').innerHTML = `<strong>${ex.titre}</strong> (${ex.niveau})<br>${ex.enonce}`;

    let html = '';
    
    // Génération selon le type d'exercice
    if (ex.type === 'tableau-menu') {
        html += `<table class="eval-table"><thead><tr><th>Élément</th><th>Choix</th></tr></thead><tbody>`;
        ex.questions.forEach(q => {
            html += `<tr><td>${q.enonce}</td><td><select id="select-${q.id}">`;
            html += `<option value="">-- Choisir --</option>`;
            q.options.forEach(o => html += `<option value="${o.texte}">${o.texte}</option>`);
            html += `</select></td></tr>`;
        });
        html += `</tbody></table>`;
    } else if (ex.type === 'choix-multiple') {
        ex.options.forEach((opt, idx) => {
            html += `<label class="checkbox-label"><input type="checkbox" name="ex-check" value="${idx}"> ${opt.texte}</label><br>`;
        });
    } else if (ex.type === 'valeur-numerique' || ex.type === 'reponse-saisie') {
        html += `<input type="text" id="eval-input-text" class="input-text" placeholder="Saisissez votre réponse ici...">`;
    } else if (ex.type === 'association') {
        ex.associations.forEach((assoc, idx) => {
            html += `<div class="assoc-row"><span>${assoc.terme} ➡️ </span><select id="assoc-${idx}">`;
            html += `<option value="">-- Sélectionner la définition --</option>`;
            ex.associations.forEach(a => html += `<option value="${a.definition}">${a.definition}</option>`);
            html += `</select></div>`;
        });
    } else if (ex.type === 'texte-trous-libre') {
        let texteFormate = ex.texte.replace(/\{\{\}\}/g, '<input type="text" class="input-hole">');
        html += `<div class="holes-container">${texteFormate}</div>`;
    } else if (ex.type === 'texte-trous-liste-unique') {
        let optionsHtml = `<option value="">-- Choix --</option>` + ex.listeCommune.map(l => `<option value="${l}">${l}</option>`).join('');
        let texteFormate = ex.texte.replace(/\{\{\}\}/g, `<select class="select-hole">${optionsHtml}</select>`);
        html += `<div class="holes-container">${texteFormate}</div>`;
    } else if (ex.type === 'texte-trous-liste-variable') {
        let count = 0;
        let texteFormate = ex.texte.replace(/\{\{\}\}/g, () => {
            let optionsHtml = `<option value="">-- Choix --</option>` + ex.trous[count].liste.map(l => `<option value="${l}">${l}</option>`).join('');
            count++;
            return `<select class="select-hole-var">${optionsHtml}</select>`;
        });
        html += `<div class="holes-container">${texteFormate}</div>`;
    } else if (ex.type === 'choix-unique') {
        ex.options.forEach((opt, idx) => {
            html += `<label class="radio-label"><input type="radio" name="ex-radio" value="${idx}"> ${opt.texte}</label><br>`;
        });
    }

    $('#eval-content').innerHTML = html;
}

function demarrerChronoEval() {
    clearInterval(evalTimer);
    updateTimerDisplay('#eval-timer', evalTempsRestant);
    evalTimer = setInterval(() => {
        evalTempsRestant--;
        updateTimerDisplay('#eval-timer', evalTempsRestant);
        if (evalTempsRestant <= 0) {
            clearInterval(evalTimer);
            validerExerciceEval();
        }
    }, 1000);
}

function validerExerciceEval() {
    clearInterval(evalTimer);
    const ex = data.evaluation[evalIndex];
    let ptsGagnes = 0;

    // Calcul de la note selon le type
    if (ex.type === 'tableau-menu') {
        ex.questions.forEach(q => {
            const val = $(`#select-${q.id}`).value;
            const bonne = q.options.find(o => o.correct);
            if (val === bonne.texte) ptsGagnes += q.pts;
        });
    } else if (ex.type === 'choix-multiple') {
        const checked = Array.from(document.querySelectorAll('input[name="ex-check"]:checked')).map(c => parseInt(c.value));
        ex.options.forEach((opt, idx) => {
            if (opt.correct && checked.includes(idx)) ptsGagnes += opt.pts;
        });
    } else if (ex.type === 'valeur-numerique' || ex.type === 'reponse-saisie') {
        const val = $('#eval-input-text').value.trim();
        let correct = ex.bonnesReponses.some(r => {
            let v = val, ref = r;
            if (ex.ignorerCasse) { v = v.toLowerCase(); ref = ref.toLowerCase(); }
            if (ex.ignorerAccents) { v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); ref = ref.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
            return v === ref;
        });
        if (correct) ptsGagnes = ex.pts;
    } else if (ex.type === 'association') {
        ex.associations.forEach((assoc, idx) => {
            if ($(`#assoc-${idx}`).value === assoc.definition) ptsGagnes += assoc.pts;
        });
    } else if (ex.type === 'texte-trous-libre') {
        const inputs = document.querySelectorAll('.input-hole');
        inputs.forEach((inp, idx) => {
            if (ex.trous[idx].bonnesReponses.includes(inp.value.trim().toLowerCase())) {
                ptsGagnes += ex.trous[idx].pts;
            }
        });
    } else if (ex.type === 'texte-trous-liste-unique') {
        const selects = document.querySelectorAll('.select-hole');
        selects.forEach((sel, idx) => {
            if (sel.value === ex.trous[idx].bonneReponse) ptsGagnes += ex.trous[idx].pts;
        });
    } else if (ex.type === 'texte-trous-liste-variable') {
        const selects = document.querySelectorAll('.select-hole-var');
        selects.forEach((sel, idx) => {
            if (sel.value === ex.trous[idx].bonneReponse) ptsGagnes += ex.trous[idx].pts;
        });
    } else if (ex.type === 'choix-unique') {
        const selected = document.querySelector('input[name="ex-radio"]:checked');
        if (selected) {
            const idx = parseInt(selected.value);
            if (ex.options[idx].correct) ptsGagnes = ex.options[idx].pts;
        }
    }

    evalReponses.push({ titre: ex.titre, pts: ptsGagnes, totalEx: ObtenirTotalPtsEx(ex) });
    evalScoreTotal += ptsGagnes;

    evalIndex++;
    if (evalIndex < data.evaluation.length) {
        afficherExerciceEval();
    } else {
        afficherBilanFinal();
    }
}

function ObtenirTotalPtsEx(ex) {
    if (ex.pts) return ex.pts;
    if (ex.questions) return ex.questions.reduce((a, q) => a + q.pts, 0);
    if (ex.options) return ex.options.reduce((a, o) => a + (o.pts || 0), 0);
    if (ex.associations) return ex.associations.reduce((a, ass) => a + ass.pts, 0);
    if (ex.trous) return ex.trous.reduce((a, t) => a + t.pts, 0);
    return 0;
}

// ========== 4. BILAN FINAL & PDF ==========
function afficherBilanFinal() {
    $('#section-eval').classList.add('hidden');
    $('#pdf-report-area').classList.remove('hidden');

    const totalGlobal = quizScore + evalScoreTotal;
    let mention = 'À travailler 📝';
    if (totalGlobal >= 48) mention = 'ExcellentWork ! 🌟';
    else if (totalGlobal >= 40) mention = 'Très bien ! 👏';
    else if (totalGlobal >= 28) mention = 'Satisfaisant 👍';

    let html = `
    <div class="score-summary">
        <h3>Résultats de l'Élève - Enseignant : Mr DURAND</h3>
        <p class="score-main">Score Total : <strong>${totalGlobal.toFixed(1)} / 55</strong></p>
        <p>• Quiz de compréhension : ${quizScore} / 15</p>
        <p>• Évaluation pratique : ${evalScoreTotal.toFixed(1)} / 40</p>
        <p class="mention">Mention : <strong>${mention}</strong></p>
    </div>
    <hr>
    <h4>Détail des exercices pratiques :</h4>
    <ul class="results-list">`;

    evalReponses.forEach(r => {
        html += `<li><strong>${r.titre}</strong> : ${r.pts.toFixed(1)} / ${r.totalEx} pts</li>`;
    });
    html += `</ul>`;

    $('#resultats-detail').innerHTML = html;
}

function genererPDF() {
    const element = $('#pdf-report-area');
    const opt = {
        margin:       10,
        filename:     'Bilan_Analyse_Du_Besoin_Mr_DURAND.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

// ========== UTILITAIRES ==========
function updateTimerDisplay(selector, tempsSec) {
    const minutes = String(Math.floor(tempsSec / 60)).padStart(2, '0');
    const secondes = String(tempsSec % 60).padStart(2, '0');
    $(selector).textContent = `⏱️ ${minutes}:${secondes}`;
}
