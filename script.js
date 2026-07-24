
let data = null;
let eleve = { nom: "", prenom: "", classe: "" };
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
    if (!array || !Array.isArray(array)) return [];
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
    if (!texte) return "";
    let t = texte.trim();
    if (ignorerCasse) t = t.toLowerCase();
    if (ignorerAccents) t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return t;
}

function remplacerTrous(texte, elements) {
    let parts = texte.split(/\{\{\d*\}\}/g);
    let resultat = parts[0];
    for (let i = 0; i < elements.length; i++) {
        resultat += elements[i] + (parts[i + 1] || '');
    }
    return resultat;
}

// ========== CHARGEMENT DES DONNÉES ==========
async function chargerDonnees() {
    try {
        const res = await fetch('questions.json?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
    } catch (e) {
        console.error("Erreur de chargement du JSON:", e);
        alert("Impossible de charger le fichier questions.json. Vérifiez qu'il est présent.");
        return;
    }
    initialiserCours();
    preparerQuiz();
    preparerEval();
}

// ========== GESTION DE L'IDENTIFICATION ==========
document.getElementById('form-identification').addEventListener('submit', (e) => {
    e.preventDefault();
    eleve.nom = $('#input-nom').value.trim();
    eleve.prenom = $('#input-prenom').value.trim();
    eleve.classe = $('#input-classe').value;

    if (!eleve.nom || !eleve.prenom || !eleve.classe) {
        alert("Veuillez remplir tous les champs et sélectionner une classe.");
        return;
    }

    $('#section-identification').classList.add('hidden');
    $('#section-cours').classList.remove('hidden');
});

// ========== INITIALISATION DU COURS ==========
function initialiserCours() {
    const icons = [
        "fa-solid fa-bullseye",
        "fa-solid fa-diagram-project",
        "fa-solid fa-file-contract",
        "fa-solid fa-timeline"
    ];

    let html = `
        <div class="cours-intro-box">
            <div class="intro-icon"><i class="fa-solid fa-compass"></i></div>
            <div class="intro-content">
                <strong>Focus du Module 2</strong>
                <p>${data.cours.introduction}</p>
            </div>
        </div>
    `;

    data.cours.sections.forEach((s, index) => {
        const iconClass = icons[index] || "fa-solid fa-bookmark";
        
        if (s.titre.includes("Déroulement")) {
            html += `
                <div class="cours-card full-width">
                    <div class="card-icon"><i class="${iconClass}"></i></div>
                    <div class="card-body">
                        <h3>${s.titre}</h3>
                        <p class="section-desc">${s.contenu}</p>
                        <div class="timeline-container">
                            <div class="timeline-step">
                                <span class="step-num">1</span>
                                <span class="step-title">Introduction</span>
                                <span class="step-desc">Objectifs & Cadre</span>
                            </div>
                            <div class="timeline-step">
                                <span class="step-num">2</span>
                                <span class="step-title">Théorie</span>
                                <span class="step-desc">Cours & CDCF</span>
                            </div>
                            <div class="timeline-step">
                                <span class="step-num">3</span>
                                <span class="step-title">Pratique</span>
                                <span class="step-desc">Cas concrets</span>
                            </div>
                            <div class="timeline-step">
                                <span class="step-num">4</span>
                                <span class="step-title">Restitution</span>
                                <span class="step-desc">Débat & Bilan</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="cours-card">
                    <div class="card-icon"><i class="${iconClass}"></i></div>
                    <div class="card-body">
                        <h3>${s.titre}</h3>
                        <p>${s.contenu}</p>
                    </div>
                </div>
            `;
        }
    });

    $('#contenu-cours').innerHTML = html;
    
    const countQuiz = data.quizComprehension ? data.quizComprehension.length : 15;
    const btnQuizSpan = $('#btn-commencer-quiz span');
    if (btnQuizSpan) {
        btnQuizSpan.textContent = `Commencer le Quiz de Vérification (${countQuiz} questions)`;
    }
}

// ========== QUIZ DE COMPRÉHENSION ==========
function preparerQuiz() {
    quizQuestions = shuffle(data.quizComprehension).map(q => {
        let newQ = { ...q };
        if (newQ.options) {
            newQ.options = shuffle(newQ.options);
        }
        return newQ;
    });
    $('#btn-commencer-quiz').addEventListener('click', demarrerQuiz);
}

function demarrerQuiz() {
    $('#section-cours').classList.add('hidden');
    $('#section-quiz').classList.remove('hidden');
    
    const titleHeader = $('#quiz-title');
    if (titleHeader) titleHeader.textContent = `🧠 Quiz de compréhension (${quizQuestions.length} questions)`;

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

    const type = q.type || (q.options ? 'qcm' : 'choix-unique');

    if (type === 'qcm' || type === 'choix-unique') {
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
    } else if (type === 'choix-multiple') {
        q.options.forEach((opt, i) => {
            const div = document.createElement('div');
            div.className = 'option-item';
            div.innerHTML = `<input type="checkbox" id="qcm${i}" value="${i}"><label for="qcm${i}">${opt.texte}</label>`;
            div.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') div.querySelector('input').checked = !div.querySelector('input').checked;
                div.classList.toggle('selected', div.querySelector('input').checked);
            });
            optDiv.appendChild(div);
        });
    } else if (type === 'valeur-numerique' || type === 'epellation' || type === 'reponse-saisie') {
        optDiv.innerHTML = `<input type="text" class="reponse-saisie-input" id="quiz-saisie-input" placeholder="Saisis ta réponse ici...">`;
    } else if (type === 'association') {
        renderAssociation(q, optDiv);
    } else if (type === 'texte-trous-libre') {
        renderTexteTrousLibre(q, optDiv);
    } else if (type === 'texte-trous-liste-unique') {
        renderTexteTrousListeUnique(q, optDiv);
    } else if (type === 'texte-trous-liste-variable') {
        renderTexteTrousListeVariable(q, optDiv);
    }

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
    t.classList.toggle('warning', tempsQuizRestant < 60);
}

$('#btn-suivant-quiz').addEventListener('click', () => {
    const q = quizQuestions[quizIndex];
    let bonne = false;
    let repEleveStr = 'Aucune réponse';
    let bonneRepStr = '';

    const type = q.type || (q.options ? 'qcm' : 'choix-unique');

    if (type === 'qcm' || type === 'choix-unique') {
        const sel = document.querySelector('input[name="quiz-opt"]:checked');
        if (sel) {
            const selOpt = q.options[parseInt(sel.value)];
            bonne = selOpt.correct;
            repEleveStr = selOpt.texte;
        }
        const bOpt = q.options.find(o => o.correct);
        bonneRepStr = bOpt ? bOpt.texte : '';
    } else if (type === 'choix-multiple') {
        let allCorrect = true;
        let cbs = $$('#quiz-options input[type="checkbox"]');
        let selectedTexts = [];
        cbs.forEach(cb => {
            const opt = q.options[parseInt(cb.value)];
            if (cb.checked) selectedTexts.push(opt.texte);
            if (cb.checked !== opt.correct) allCorrect = false;
        });
        bonne = allCorrect;
        repEleveStr = selectedTexts.join(', ') || 'Aucune sélection';
        bonneRepStr = q.options.filter(o => o.correct).map(o => o.texte).join(', ');
    } else if (type === 'valeur-numerique') {
        const inp = $('#quiz-saisie-input');
        const val = (inp ? inp.value : '').replace(/\s/g, '').replace(',', '.').toLowerCase();
        const reponses = q.bonnesReponses || [];
        bonne = reponses.some(r => r.replace(/\s/g, '').replace(',', '.').toLowerCase() === val);
        repEleveStr = inp ? inp.value : 'Aucune';
        bonneRepStr = reponses[0] || '';
    } else if (type === 'epellation' || type === 'reponse-saisie') {
        const inp = $('#quiz-saisie-input');
        const val = normaliserTexte(inp ? inp.value : '', q.ignorerCasse !== false, q.ignorerAccents !== false);
        if (q.bonneReponse) {
            bonne = (normaliserTexte(q.bonneReponse, q.ignorerCasse !== false, q.ignorerAccents !== false) === val);
            bonneRepStr = q.bonneReponse;
        } else if (q.bonnesReponses) {
            bonne = q.bonnesReponses.some(r => normaliserTexte(r, q.ignorerCasse !== false, q.ignorerAccents !== false) === val);
            bonneRepStr = q.bonnesReponses[0];
        }
        repEleveStr = inp ? inp.value : 'Aucune';
    } else if (type === 'association') {
        let total = q.associations.length;
        let exacts = 0;
        let reponsesUser = [];
        $$('#quiz-options .association-item').forEach(item => {
            const terme = item.dataset.terme;
            const val = item.querySelector('select').value;
            const target = q.associations.find(a => a.terme === terme);
            if (target && val === target.definition) exacts++;
            reponsesUser.push(`${terme} ➔ ${val || '?'}`);
        });
        bonne = (exacts === total);
        repEleveStr = reponsesUser.join(' | ');
        bonneRepStr = q.associations.map(a => `${a.terme} ➔ ${a.definition}`).join(' | ');
    } else if (type.startsWith('texte-trous')) {
        let total = q.trous.length;
        let exacts = 0;
        let reponsesUser = [];
        $$('#quiz-options [data-trou-index]').forEach(el => {
            const idx = parseInt(el.dataset.trouIndex);
            const trou = q.trous[idx];
            const val = el.value || '';
            let isOk = false;
            if (trou.bonneReponse) {
                isOk = (normaliserTexte(val, true, true) === normaliserTexte(trou.bonneReponse, true, true));
            } else if (trou.bonnesReponses) {
                isOk = trou.bonnesReponses.some(r => normaliserTexte(r, true, true) === normaliserTexte(val, true, true));
            }
            if (isOk) exacts++;
            reponsesUser.push(val || '?');
        });
        bonne = (exacts === total);
        repEleveStr = reponsesUser.join(', ');
        bonneRepStr = q.trous.map(t => t.bonneReponse || (t.bonnesReponses ? t.bonnesReponses[0] : '')).join(', ');
    }

    if (bonne) scoreQuiz++;

    detailsQuiz.push({
        question: q.question,
        reponseEleve: repEleveStr,
        bonneReponse: bonneRepStr,
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

// ========== ATELIER PRATIQUE / EXERCICES ==========
function preparerEval() {
    evalQuestions = shuffle(data.evaluation);
    $('#btn-suivant-eval').addEventListener('click', () => validerEtSuivantEval());
}

function afficherExerciceEval() {
    if (evalIndex >= evalQuestions.length) { terminerEval(); return; }
    const ex = evalQuestions[evalIndex];
    $('#eval-progress').textContent = `Exercice ${evalIndex + 1} / ${evalQuestions.length}`;
    $('#eval-progress-bar').style.width = `${(evalIndex / evalQuestions.length) * 100}%`;
    
    let badge = ex.niveau === 'Facile' ? '<span class="badge badge-facile">Facile</span>' :
                ex.niveau === 'Moyen' ? '<span class="badge badge-moyen">Moyen</span>' :
                '<span class="badge badge-avance">Avancé</span>';
    
    $('#eval-question').innerHTML = `<strong>${ex.titre}</strong> ${badge}<br><br>${ex.enonce}`;
    const content = $('#eval-content');
    content.innerHTML = '';
    
    const renderers = {
        'tableau-menu': renderTableauMenu,
        'choix-unique': renderChoixUnique,
        'choix-multiple': renderChoixMultiple,
        'valeur-numerique': renderValeurNumerique,
        'reponse-saisie': renderReponseSaisie,
        'association': renderAssociation,
        'texte-trous-libre': renderTexteTrousLibre,
        'texte-trous-liste-unique': renderTexteTrousListeUnique,
        'texte-trous-liste-variable': renderTexteTrousListeVariable
    };
    
    if (renderers[ex.type]) renderers[ex.type](ex, content);
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
            const o = document.createElement('option');
            o.value = opt.texte;
            o.dataset.correct = opt.correct;
            o.textContent = opt.texte;
            select.appendChild(o);
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
            if (e.target.tagName !== 'INPUT') div.querySelector('input').checked = !div.querySelector('input').checked;
            div.classList.toggle('selected', div.querySelector('input').checked);
        });
        container.appendChild(div);
    });
}

function renderValeurNumerique(ex, container) {
    container.innerHTML = `<input type="text" class="reponse-saisie-input" id="valeur-numerique-input" placeholder="Saisis ta réponse numérique...">`;
}

function renderReponseSaisie(ex, container) {
    container.innerHTML = `<input type="text" class="reponse-saisie-input" id="reponse-saisie-input" placeholder="Saisis ta réponse...">`;
}

function renderAssociation(ex, container) {
    const div = document.createElement('div');
    div.className = 'association-container';

    if (ex.image) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'exercice-image-container';
        imgContainer.style.marginBottom = "15px";
        imgContainer.style.textAlign = "center";
        
        const img = document.createElement('img');
        img.src = ex.image;
        img.alt = "Illustration de l'exercice";
        img.style.maxWidth = "100%";
        img.style.maxHeight = "350px";
        img.style.borderRadius = "8px";
        img.style.border = "1px solid #cbd5e1";
        
        imgContainer.appendChild(img);
        div.appendChild(imgContainer);
    }

    const col = document.createElement('div');
    col.className = 'association-colonne';
    col.innerHTML = '<h4>Associe chaque terme à sa correspondance :</h4>';
    const defs = shuffle(ex.associations.map(a => a.definition));
    shuffle([...ex.associations]).forEach(asso => {
        const item = document.createElement('div');
        item.className = 'association-item';
        item.dataset.terme = asso.terme;
        item.dataset.pts = asso.pts || 1;
        let selectHTML = `<strong>${asso.terme}</strong><select><option value="">-- Choisir --</option>`;
        defs.forEach(d => { selectHTML += `<option value="${d}">${d}</option>`; });
        selectHTML += '</select>';
        item.innerHTML = selectHTML;
        col.appendChild(item);
    });
    div.appendChild(col);
    container.appendChild(div);
}

function renderTexteTrousLibre(ex, container) {
    const div = document.createElement('div');
    div.className = 'texte-trous';
    const inputsHTML = ex.trous.map((trou, i) =>
        `<input type="text" data-trou-index="${i}" data-pts="${trou.pts || 1}" placeholder="..." class="trou-input">`
    );
    div.innerHTML = remplacerTrous(ex.texte, inputsHTML);
    container.appendChild(div);
}

function renderTexteTrousListeUnique(ex, container) {
    const div = document.createElement('div');
    div.className = 'texte-trous';
    const selectsHTML = ex.trous.map((trou, i) => {
        let opts = '<option value="">--</option>';
        ex.listeCommune.forEach(item => { opts += `<option value="${item}">${item}</option>`; });
        return `<select data-trou-index="${i}" data-pts="${trou.pts || 1}" class="trou-select">${opts}</select>`;
    });
    div.innerHTML = remplacerTrous(ex.texte, selectsHTML);
    container.appendChild(div);
}

function renderTexteTrousListeVariable(ex, container) {
    const div = document.createElement('div');
    div.className = 'texte-trous';
    const selectsHTML = ex.trous.map((trou, i) => {
        let opts = '<option value="">--</option>';
        trou.liste.forEach(item => { opts += `<option value="${item}">${item}</option>`; });
        return `<select data-trou-index="${i}" data-pts="${trou.pts || 1}" class="trou-select">${opts}</select>`;
    });
    div.innerHTML = remplacerTrous(ex.texte, selectsHTML);
    container.appendChild(div);
}

// ========== VALIDATION DES RÉPONSES (EVALUATION) ==========
function validerEtSuivantEval() {
    clearInterval(timerEval);
    const ex = evalQuestions[evalIndex];
    let pts = 0;
    const details = { titre: ex.titre, niveau: ex.niveau, questions: [] };

    if (ex.type === 'tableau-menu') {
        $$('#eval-content select').forEach(select => {
            const qId = select.dataset.questionId;
            const qPts = parseFloat(select.dataset.pts) || 0;
            const selOpt = select.options[select.selectedIndex];
            const correct = selOpt && selOpt.dataset.correct === 'true';
            if (correct) pts += qPts;
            const qData = ex.questions.find(q => q.id === qId);
            details.questions.push({ enonce: qData.enonce, reponseEleve: select.value || 'Aucune', bonneReponse: qData.options.find(o => o.correct).texte, correct, pts: correct ? qPts : 0 });
        });
    }
    else if (ex.type === 'choix-unique') {
        const sel = document.querySelector('input[name="choix-unique"]:checked');
        const correctOpt = ex.options.find(o => o.correct);
        if (sel) {
            const opt = ex.options[parseInt(sel.value)];
            if (opt.correct) pts += (opt.pts || ex.pts || 0);
            details.questions.push({ enonce: ex.enonce, reponseEleve: opt.texte, bonneReponse: correctOpt ? correctOpt.texte : '', correct: opt.correct, pts: opt.correct ? (opt.pts || ex.pts || 0) : 0 });
        } else {
            details.questions.push({ enonce: ex.enonce, reponseEleve: 'Aucune', bonneReponse: correctOpt ? correctOpt.texte : '', correct: false, pts: 0 });
        }
    }
    else if (ex.type === 'choix-multiple') {
        $$('#eval-content input[type="checkbox"]').forEach(cb => {
            const opt = ex.options[parseInt(cb.value)];
            const coche = cb.checked;
            const optPts = opt.pts || 0;
            if (coche && opt.correct) pts += optPts;
            details.questions.push({ enonce: opt.texte, reponseEleve: coche ? 'Coché' : 'Non coché', bonneReponse: opt.correct ? 'Coché' : 'Non coché', correct: coche === opt.correct, pts: (coche && opt.correct) ? optPts : 0 });
        });
    }
    else if (ex.type === 'valeur-numerique') {
        const val = ($('#valeur-numerique-input').value || '').replace(/\s/g, '').replace(',', '.');
        const correct = ex.bonnesReponses.some(r => r.replace(/\s/g, '').replace(',', '.') === val);
        const exPts = ex.pts || 0;
        if (correct) pts += exPts;
        details.questions.push({ enonce: ex.enonce, reponseEleve: val || 'Aucune', bonneReponse: ex.bonnesReponses[0], correct, pts: correct ? exPts : 0 });
    }
    else if (ex.type === 'reponse-saisie') {
        const val = normaliserTexte($('#reponse-saisie-input').value || '', ex.ignorerCasse, ex.ignorerAccents);
        const correct = ex.bonnesReponses.some(r => normaliserTexte(r, ex.ignorerCasse, ex.ignorerAccents) === val);
        const exPts = ex.pts || 0;
        if (correct) pts += exPts;
        details.questions.push({ enonce: ex.enonce, reponseEleve: val || 'Aucune', bonneReponse: ex.bonnesReponses[0], correct, pts: correct ? exPts : 0 });
    }
    else if (ex.type === 'association') {
        $$('#eval-content .association-item').forEach(item => {
            const terme = item.dataset.terme;
            const ptsA = parseFloat(item.dataset.pts) || 0;
            const val = item.querySelector('select').value;
            const targetAsso = ex.associations.find(a => a.terme === terme);
            const correct = targetAsso && val === targetAsso.definition;
            if (correct) pts += ptsA;
            details.questions.push({ enonce: terme, reponseEleve: val || 'Aucune', bonneReponse: targetAsso ? targetAsso.definition : '', correct, pts: correct ? ptsA : 0 });
        });
    }
    else if (ex.type === 'texte-trous-libre') {
        $$('#eval-content input[data-trou-index]').forEach(input => {
            const idx = parseInt(input.dataset.trouIndex);
            const ptsT = parseFloat(input.dataset.pts) || 0;
            const trou = ex.trous[idx];
            const val = normaliserTexte(input.value || '', true, true);
            const correct = trou.bonnesReponses.some(r => normaliserTexte(r, true, true) === val);
            if (correct) pts += ptsT;
            details.questions.push({ enonce: `Trou ${idx+1}`, reponseEleve: input.value || 'Aucune', bonneReponse: trou.bonnesReponses[0], correct, pts: correct ? ptsT : 0 });
        });
    }
    else if (ex.type === 'texte-trous-liste-unique' || ex.type === 'texte-trous-liste-variable') {
        $$('#eval-content select[data-trou-index]').forEach(select => {
            const idx = parseInt(select.dataset.trouIndex);
            const ptsT = parseFloat(select.dataset.pts) || 0;
            const trou = ex.trous[idx];
            const val = select.value;
            const correct = val === trou.bonneReponse;
            if (correct) pts += ptsT;
            details.questions.push({ enonce: `Trou ${idx+1}`, reponseEleve: val || 'Aucune', bonneReponse: trou.bonneReponse, correct, pts: correct ? ptsT : 0 });
        });
    }

    scoreEval += pts;
    details.points = Math.round(pts * 10) / 10;
    
    let totalP = 0;
    if (ex.type === 'tableau-menu') totalP = ex.questions.reduce((s,q) => s + (q.pts || 0), 0);
    else if (ex.type === 'association') totalP = ex.associations.reduce((s,a) => s + (a.pts || 0), 0);
    else if (ex.trous) totalP = ex.trous.reduce((s,t) => s + (t.pts || 0), 0);
    else if (ex.pts) totalP = ex.pts;
    else if (ex.options) totalP = ex.options.reduce((s,o) => s + (o.pts || 0), 0);
    
    details.totalPossible = totalP;
    detailsEval.push(details);
    evalIndex++;
    afficherExerciceEval();
}

function terminerEval() {
    $('#section-eval').classList.add('hidden');
    afficherResultats();
    genererPDFResultats();
}

// ========== RESULTATS & PDF ==========
function afficherResultats() {
    const zone = $('#pdf-report-area');
    zone.classList.remove('hidden');
    
    $('#eleve-info-recap').innerHTML = `
        <h3>👤 Informations de l'élève</h3>
        <p><strong>Nom :</strong> ${eleve.nom}</p>
        <p><strong>Prénom :</strong> ${eleve.prenom}</p>
        <p><strong>Classe :</strong> ${eleve.classe}</p>
    `;

    const totalQuiz = quizQuestions.length;
    const totalEval = 40;
    const total = scoreQuiz + scoreEval;
    const totalMax = totalQuiz + totalEval;
    const ratio = total / totalMax;

    const mention = ratio >= 0.85 ? '🏆 Excellent' : ratio >= 0.70 ? '👍 Très bien' : ratio >= 0.50 ? '✅ Bien' : ratio >= 0.30 ? '📚 À renforcer' : '⚠️ À retravailler';
    
    let html = `<div class="score-final">🎯 Bilan Module 2 : ${total.toFixed(1)} / ${totalMax} pts<br><small>Théorie/Quiz : ${scoreQuiz}/${totalQuiz} | Pratique/Exercices : ${scoreEval.toFixed(1)}/${totalEval}</small><br><small>${mention}</small></div>`;
    html += `<div class="resultat-section"><h3>📋 Restitution - Partie Théorique (Quiz)</h3>`;
    detailsQuiz.forEach((d, i) => {
        html += `<div class="detail-exercice ${d.correct ? '' : 'erreur'}"><strong>Q${i+1}.</strong> ${d.question}<br>${d.correct ? '✅ Bonne réponse' : `❌ "${d.reponseEleve}" → Attendu : "${d.bonneReponse}"`}</div>`;
    });
    html += `</div><div class="resultat-section"><h3>📝 Restitution - Partie Exercices Pratiques</h3>`;
    detailsEval.forEach(d => {
        const nb = d.questions.filter(q => q.correct).length;
        const ok = nb === d.questions.length;
        html += `<div class="detail-exercice ${ok ? '' : 'erreur'}"><strong>${d.titre}</strong> — ${d.points}/${d.totalPossible} pts (${nb}/${d.questions.length})<br>`;
        d.questions.forEach(q => {
            html += `<div class="detail-question ${q.correct ? 'bonne' : 'mauvaise'}">${q.correct ? '✅' : '❌'} ${q.enonce} — ${q.correct ? q.reponseEleve : `"${q.reponseEleve}" → "${q.bonneReponse}"`}</div>`;
        });
        html += `</div>`;
    });
    html += `</div>`;
    $('#resultats-detail').innerHTML = html;
    zone.scrollIntoView({ behavior: 'smooth' });
}

function genererPDFResultats() {
    const el = $('#pdf-report-area');
    el.classList.remove('hidden');
    el.style.display = 'block';

    const nomFichierSecurise = `Bilan_Module2_${eleve.nom}_${eleve.prenom}_${eleve.classe}`.replace(/[^a-zA-Z0-9_-]/g, "_");

    setTimeout(() => {
        html2pdf().set({
            margin: [10,10,10,10],
            filename: `${nomFichierSecurise}.pdf`,
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
