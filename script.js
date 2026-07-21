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
    afficherExerciceEval();
}

function preparerEval() {
    evalQuestions = shuffle(data.evaluation);
    $('#btn-suivant-eval').addEventListener('click', () => validerEtSuivantEval());
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
        if (tempsRestant <= 0) {
            clearInterval(timerEval);
            validerEtSuivantEval();
        }
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
       
