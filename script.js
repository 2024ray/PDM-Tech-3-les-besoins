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
let eleveActuel = null;

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
    if (ignorerAccents) t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return t;
}

function remplacerTrous(texte, elements) {
    const parties = texte.split('{{}}');
    let resultat = parties[0];
    for (let i = 0; i < elements.length; i++) {
        resultat += elements[i] + (parties[i + 1] || '');
    }
    return resultat;
}

// ========== INITIALISATION & ÉCRAN DE CONNEXION ==========
document.addEventListener('DOMContentLoaded', () => {
    injecterEcranConnexion();
});

function injecterEcranConnexion() {
    const mainContainer = $('main.container');
    if (!mainContainer) return;

    mainContainer.innerHTML = `
        <div class="card login-card" style="max-width: 500px; margin: 40px auto; padding: 30px; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2>🎓 Connexion à l'évaluation</h2>
                <p style="color: #666; font-size: 0.95rem;">Veuillez renseigner vos informations pour accéder au Module.</p>
            </div>
            <form id="form-connexion" style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label for="input-nom" style="display: block; font-weight: 600; margin-bottom: 5px;">Nom et Prénom :</label>
                    <input type="text" id="input-nom" required placeholder="Ex: Dupont Jean" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px;">
                </div>
                <div>
                    <label for="select-classe" style="display: block; font-weight: 600; margin-bottom: 5px;">Classe :</label>
                    <select id="select-classe" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff;">
                        <option value="">-- Choisir la classe --</option>
                        <option value="3èmeA">3ème A</option>
                        <option value="3èmeB">3ème B</option>
                        <option value="3èmeC">3ème C</option>
                        <option value="3èmePM">3ème PM</option>
                    </select>
                </div>
                <div>
                    <label for="input-code" style="display: block; font-weight: 600; margin-bottom: 5px;">Code d'identification élève :</label>
                    <input type="password" id="input-code" required placeholder="Entrez votre code secret" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px;">
                </div>
                <button type="submit" style="margin-top: 10px; padding: 12px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Accéder au module</button>
            </form>
            <div id="login-error" style="color: #e11d48; text-align: center; margin-top: 15px; font-size: 0.9rem;"></div>
        </div>
    `;

    $('#form-connexion').addEventListener('submit', (e) => {
        e.preventDefault();
        const nom = $('#input-nom').value.trim();
        const classe = $('#select-classe').value;
        const code = $('#input-code').value.trim();

        if (!nom || !classe || !code) {
            $('#login-error').textContent = "Tous les champs sont obligatoires.";
            return;
        }

        // Sécurité supplémentaire : Vérification de la clé unique par élève
        eleveActuel = { nom, classe, code };
        const cleStockage = `module_termine_${classe}_${code}_${nom.replace(/\s+/g, '_')}`;
        
        if (localStorage.getItem(cleStockage) === 'true') {
            afficherMessageVerrouillage();
            return;
        }

        // Si tout est ok, on charge le contenu initial de la page (cours, etc.)
        restaurerStructureHTMLPrincipale();
        chargerDonnees();
    });
}

function restaurerStructureHTMLPrincipale() {
    $('main.container').innerHTML = `
        <!-- Section Cours -->
        <section id="section-cours" class="card">
            <h2>📚 Cours : Analyse du Besoin & CDCF</h2>
            <div id="contenu-cours"></div>
            <div style="text-align: right; margin-top: 20px;">
                <button id="btn-commencer-quiz" class="btn primary">Commencer le Quiz de Compréhension ➔</button>
            </div>
        </section>

        <!-- Section Quiz (15 Questions) -->
        <section id="section-quiz" class="card hidden">
            <div class="quiz-header">
                <h2>📋 Quiz de Compréhension</h2>
                <div id="quiz-timer" class="timer">⏱️ 20:00</div>
            </div>
            <div class="progress-container">
                <div id="quiz-progress">Question 1 / 15</div>
                <div class="progress-bar"><div id="quiz-progress-bar" style="width: 0%;"></div></div>
            </div>
            <div id="quiz-question" class="question-box"></div>
            <div id="quiz-options" class="options-container"></div>
            <div style="text-align: right; margin-top: 20px;">
                <button id="btn-suivant-quiz" class="btn primary hidden">Valider et Continuer ➔</button>
            </div>
        </section>

        <!-- Section Évaluation Pratique -->
        <section id="section-eval" class="card hidden">
            <div class="quiz-header">
                <h2>🛠️ Atelier Pratique & Études de Cas</h2>
                <div id="eval-timer" class="timer">⏱️ 01:30</div>
            </div>
            <div class="progress-container">
                <div id="eval-progress">Exercice 1 / 4</div>
                <div class="progress-bar"><div id="eval-progress-bar" style="width: 0%;"></div></div>
            </div>
            <div id="eval-question" class="question-box"></div>
            <div id="eval-content" class="eval-content-container"></div>
            <div style="text-align: right; margin-top: 20px;">
                <button id="btn-suivant-eval" class="btn primary">Valider l'exercice ➔</button>
            </div>
        </section>

        <!-- Zone de Rapport / PDF -->
        <div id="pdf-report-area" class="card hidden">
            <h2>📊 Bilan & Restitution Officielle</h2>
            <div id="infos-eleve-bilan" style="margin-bottom: 15px; font-weight: bold; color: #333;"></div>
            <div id="resultats-detail"></div>
            <div style="text-align: center; margin-top: 30px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button id="btn-telecharger-pdf" class="btn primary">📥 Télécharger mon Bilan (PDF)</button>
            </div>
        </div>
    `;
    
    // Réattacher les écouteurs globaux
    $('#btn-telecharger-pdf').addEventListener('click', genererPDFResultats);
}

async function chargerDonnees() {
    try {
        const res = await fetch('questions.json?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
    } catch (e) {
        console.error("Erreur de chargement du JSON:", e);
        return;
    }
    initialiserCours();
    preparerQuiz();
    preparerEval();
}

function afficherMessageVerrouillage() {
    $('main.container').innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
            <h2>🔒 Séance déjà réalisée</h2>
            <p>Vous avez déjà soumis vos réponses pour ce module avec cet identifiant. Il n'est pas possible de refaire les questions.</p>
            <button onclick="location.reload()" class="btn secondary" style="margin-top: 20px;">Retour à l'accueil</button>
        </div>
    `;
}

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
                <strong>Focus du Module</strong>
                <p>${data.cours.introduction}</p>
            </div>
        </div>
    `;

    data.cours.sections.forEach((s, index) => {
        const iconClass = icons[index] || "fa-solid fa-bookmark";
        html += `
            <div class="cours-card">
                <div class="card-icon"><i class="${iconClass}"></i></div>
                <div class="card-body">
                    <h3>${s.titre}</h3>
                    <p>${s.contenu}</p>
                </div>
            </div>
        `;
    });

    $('#contenu-cours').innerHTML = html;
}

// ========== QUIZ ==========
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
    t.classList.toggle('warning', tempsQuizRestant < 60);
}

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-suivant-quiz') {
        const sel = document.querySelector('input[name="quiz-opt"]:checked');
        const q = quizQuestions[quizIndex];
        let bonne = false;
        if (sel) {
            bonne = q.options[parseInt(sel.value)].correct;
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
    }
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

// ========== ATELIER PRATIQUE ==========
function preparerEval() {
    evalQuestions = shuffle(data.evaluation);
    const btnEv = $('#btn-suivant-eval');
    if (btnEv) {
        btnEv.addEventListener('click', () => validerEtSuivantEval());
    }
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
    if (!t) return;
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
    const col = document.createElement('div');
    col.className = 'association-colonne';
    col.innerHTML = '<h4>Associe chaque terme à sa correspondance :</h4>';
    const defs = shuffle(ex.associations.map(a => a.definition));
    shuffle([...ex.associations]).forEach(asso => {
        const item = document.createElement('div');
        item.className = 'association-item';
        item.dataset.terme = asso.terme;
        item.dataset.pts = asso.pts;
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
        `<input type="text" data-trou-index="${i}" data-pts="${trou.pts}" placeholder="..." class="trou-input">`
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
        return `<select data-trou-index="${i}" data-pts="${trou.pts}" class="trou-select">${opts}</select>`;
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
        return `<select data-trou-index="${i}" data-pts="${trou.pts}" class="trou-select">${opts}</select>`;
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
        $$('#eval-content select').forEach(select => {
            const qId = select.dataset.questionId;
            const qPts = parseFloat(select.dataset.pts);
            const selOpt = select.options[select.selectedIndex];
            const correct = selOpt && selOpt.dataset.correct === 'true';
            if (correct) pts += qPts;
            const qData = ex.questions.find(q => q.id === qId);
            details.questions.push({ enonce: qData.enonce, reponseEleve: select.value || 'Aucune', bonneReponse: qData.options.find(o => o.correct).texte, correct, pts: correct ? qPts : 0 });
        });
    }
    else if (ex.type === 'choix-unique') {
        const sel = document.querySelector('input[name="choix-unique"]:checked');
        if (sel) {
            const opt = ex.options[parseInt(sel.value)];
            if (opt.correct) pts += opt.pts;
            details.questions.push({ enonce: ex.enonce, reponseEleve: opt.texte, bonneReponse: ex.options.find(o => o.correct).texte, correct: opt.correct, pts: opt.correct ? opt.pts : 0 });
        }
    }
    else if (ex.type === 'choix-multiple') {
        $$('#eval-content input[type="checkbox"]').forEach(cb => {
            const opt = ex.options[parseInt(cb.value)];
            const coche = cb.checked;
            if (coche && opt.correct) pts += opt.pts;
            details.questions.push({ enonce: opt.texte, reponseEleve: coche ? 'Coché' : 'Non coché', bonneReponse: opt.correct ? 'Coché' : 'Non coché', correct: coche === opt.correct, pts: (coche && opt.correct) ? opt.pts : 0 });
        });
    }
    else if (ex.type === 'valeur-numerique') {
        const val = ($('#valeur-numerique-input').value || '').replace(/\s/g, '').replace(',', '.');
        const correct = ex.bonnesReponses.some(r => r.replace(/\s/g, '').replace(',', '.') === val);
        if (correct) pts += ex.pts;
        details.questions.push({ enonce: ex.enonce, reponseEleve: val || 'Aucune', bonneReponse: ex.bonnesReponses[0], correct, pts: correct ? ex.pts : 0 });
    }
    else if (ex.type === 'reponse-saisie') {
        const val = normaliserTexte($('#reponse-saisie-input').value || '', ex.ignorerCasse, ex.ignorerAccents);
        const correct = ex.bonnesReponses.some(r => normaliserTexte(r, ex.ignorerCasse, ex.ignorerAccents) === val);
        if (correct) pts += ex.pts;
        details.questions.push({ enonce: ex.enonce, reponseEleve: val || 'Aucune', bonneReponse: ex.bonnesReponses[0], correct, pts: correct ? ex.pts : 0 });
    }
    else if (ex.type === 'association') {
        $$('#eval-content .association-item').forEach(item => {
            const terme = item.dataset.terme;
            const ptsA = parseFloat(item.dataset.pts);
            const val = item.querySelector('select').value;
            const correct = val === ex.associations.find(a => a.terme === terme).definition;
            if (correct) pts += ptsA;
            details.questions.push({ enonce: terme, reponseEleve: val || 'Aucune', bonneReponse: ex.associations.find(a => a.terme === terme).definition, correct, pts: correct ? ptsA : 0 });
        });
    }
    else if (ex.type === 'texte-trous-libre') {
        $$('#eval-content input[data-trou-index]').forEach(input => {
            const idx = parseInt(input.dataset.trouIndex);
            const ptsT = parseFloat(input.dataset.pts);
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
            const ptsT = parseFloat(select.dataset.pts);
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
    if (ex.type === 'tableau-menu') totalP = ex.questions.reduce((s,q) => s+q.pts, 0);
    else if (ex.type === 'association') totalP = ex.associations.reduce((s,a) => s+a.pts, 0);
    else if (ex.trous) totalP = ex.trous.reduce((s,t) => s+t.pts, 0);
    else if (ex.pts) totalP = ex.pts;
    else if (ex.options) totalP = ex.options.reduce((s,o) => s+(o.pts||0), 0);
    details.totalPossible = totalP;
    detailsEval.push(details);
    evalIndex++;
    afficherExerciceEval();
}

function terminerEval() {
    if (eleveActuel) {
        const cleStockage = `module_termine_${eleveActuel.classe}_${eleveActuel.code}_${eleveActuel.nom.replace(/\s+/g, '_')}`;
        localStorage.setItem(cleStockage, 'true');
    }

    $('#section-eval').classList.add('hidden');
    afficherResultats();
}

function afficherResultats() {
    const zone = $('#pdf-report-area');
    zone.classList.remove('hidden');
    
    if (eleveActuel) {
        $('#infos-eleve-bilan').innerHTML = `Élève : ${eleveActuel.nom} | Classe : ${eleveActuel.classe}`;
    }

    const totalQuiz = quizQuestions.length;
    const totalEval = 40;
    const total = scoreQuiz + scoreEval;
    const mention = total >= 36 ? '🏆 Excellent' : total >= 28 ? '👍 Très bien' : total >= 20 ? '✅ Bien' : total >= 12 ? '📚 À renforcer' : '⚠️ À retravailler';
    
    let html = `<div class="score-final">🎯 Bilan : ${total.toFixed(1)} / ${totalQuiz + totalEval} pts<br><small>Théorie/Quiz : ${scoreQuiz}/${totalQuiz} | Pratique/Exercices : ${scoreEval.toFixed(1)}/${totalEval}</small><br><small>${mention}</small></div>`;
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
    setTimeout(() => {
        html2pdf().set({
            margin: [10,10,10,10],
            filename: `Bilan_${eleveActuel ? eleveActuel.classe + '_' + eleveActuel.nom.replace(/\s+/g, '_') : 'Eleve'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 960 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all','css','legacy'] }
        }).from(el).save();
    }, 100);
}
```[file: code-generated-file-91e0adda-dd94-4413-a993-a6fcad729dc5]
