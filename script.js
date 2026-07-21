
Gemini
Convertir le chat en PDF
Convertir le chat en PDF
Ouvrir ce chat dans Acrobat
Nouvelle discussion
Rechercher dans les discussions
Images
Bibliothèque
Nouveau notebook
Quiz et Évaluation avec Minuteur
Création de Site Web Technologie 3ème
Extensions GitHub Pages : Jekyll et Actions
Création d'une Évaluation Web Statique
Création Site Web Quiz Technologie 3e
Passer à la ligne sur Gemini
Héberger un site sur GitHub Pages
Création Site Révision Technologie 3e
Plateforme Révision Technologie 3e Complète
Préciser la version logicielle 2.6.2
Décryptage du Message Codé de Jules
Zéro Copier-Coller, Sur-Mesure Direct
Dernières versions de Flip PDF
Je Vous Entends Cinq Sur Cinq
Accès au contenu impossible
Supprimer Hasleo du démarrage Windows
Correction et reformulation d'un message
Enregistrer une page web : Méthodes et astuces
Capturer une page web entière
Conversion de note sur 25 en note sur 20
Projet informatique : gouvernance et communication interne
Reformuler un message professionnel rapidement
Démarrer sur Clé USB via Rufus
Réparer Windows avec Gandalf PE
Sauvegarder et restaurer avec Hasleo Backup
Hasleo Backup Suite sur EOLE
Antivirus bloque fichier : comment installer
Convertir une note sur 25 en 20
Test de Communication Réussi
Malentendu sur une expression enfantine

Activité
France
D'après vos adresses (domicile)
Mettre à jour la position
Conversation avec Gemini
change le code pourqu'a chaque qestion on fasse suivant q'un minuteur de 1m soit mise pour chaque question ainsi q'une barre de progression :

Voici les modifications à apporter au code HTML, CSS et JavaScript pour transformer les quiz et l'évaluation en un système question par question avec minuteur de 60 secondes par question et barre de progression.

1. Modifications CSS (style.css)
Ajoutez ces styles à la fin de votre fichier style.css pour gérer l'affichage de la barre de progression, du minuteur et des boutons de navigation :  
CSS

CSS
/* --- TIMER & PROGRESS BAR --- */
.progress-container {
    width: 100%;
    background-color: #e2e8f0;
    border-radius: 20px;
    height: 12px;
    overflow: hidden;
    margin-bottom: 1.5rem;
}

.progress-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--primary), #3b82f6);
    transition: width 0.3s ease;
}

.step-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
}

.timer-badge {
    font-size: 1.1rem;
    font-weight: bold;
    padding: 6px 14px;
    border-radius: 20px;
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
}

.timer-warning {
    background-color: #fee2e2 !important;
    color: #991b1b !important;
    border-color: #fca5a5 !important;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
}
2. Modifications HTML (index.html)
Remplacez les sections du Quiz et de l'Évaluation pour intégrer les conteneurs du minuteur, de la barre de progression et des boutons "Suivant" :  
HTML

HTML
<!-- PARTIE 2 : QUIZ DE COMPRÉHENSION -->
<section class="card">
    <div class="card-header">
        <span class="step-num bg-green">2</span>
        <h2>Quiz de vérification rapide</h2>
    </div>
    <div class="card-body">
        <div id="quiz-header-bar" class="exercise-header">
            <div id="quiz-timer" class="timer-badge">⏱️ Temps restant : 60s</div>
            <span id="quiz-step-info" class="tag bg-green">Question 1/8</span>
        </div>
        
        <div class="progress-container">
            <div id="quiz-progress-bar" class="progress-bar"></div>
        </div>

        <form id="quiz-form">
            <div id="quiz-container"></div>
            <div class="step-controls">
                <div></div> <!-- Espaceur -->
                <button type="button" id="btn-suivant-quiz" class="btn btn-green">Suivant ➔</button>
            </div>
        </form>
        <div id="quiz-feedback" class="feedback-box hidden"></div>
    </div>
</section>

<!-- PARTIE 3 : ÉVALUATION -->
<section class="card">
    <div class="card-header">
        <span class="step-num bg-purple">3</span>
        <h2>Évaluation Progressive & Grilles Tableurs (40 pts)</h2>
    </div>
    <div class="card-body">
        <div id="eval-header-bar" class="exercise-header">
            <div id="eval-timer" class="timer-badge">⏱️ Temps restant : 60s</div>
            <span id="eval-step-info" class="tag bg-purple">Question 1/X</span>
        </div>

        <div class="progress-container">
            <div id="eval-progress-bar" class="progress-bar"></div>
        </div>

        <form id="eval-form">
            <div id="eval-container"></div>
            <div class="step-controls">
                <div></div> <!-- Espaceur -->
                <button type="button" id="btn-suivant-eval" class="btn btn-primary">Suivant ➔</button>
            </div>
        </form>

        <div id="eval-results" class="results-box hidden space-y-sm">
            <div class="score-banner">
                <h3>Note Finale : <span id="note-finale">0</span> / 40</h3>
            </div>
            <div id="eval-corrections-detail" class="space-y-sm"></div>
        </div>
    </div>
</section>
3. Modifications JavaScript (script.js)
Remplacez complètement votre fichier script.js par la version ci-dessous. Elle aplanit les questions sous forme de suite séquentielle, applique un minuteur réinitialisé à chaque question et effectue le passage automatique à la question suivante en cas de dépassement du temps :  
JS

JavaScript
document.addEventListener("DOMContentLoaded", () => {
    let appData = null;

    // Mélange Fisher-Yates
    function melanger(array) {
        let copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // --- VARIABLES DE GESTION DU PARENT/STEPPER ---
    let quizQuestions = [];
    let currentQuizIndex = 0;
    let quizTimerInterval = null;

    let evalItems = [];
    let currentEvalIndex = 0;
    let evalTimerInterval = null;

    const TIMER_DURATION = 60; // 60 secondes par question

    fetch("questions.json")
        .then(res => res.json())
        .then(data => {
            appData = data;
            initialiserSite();
        })
        .catch(err => console.error("Erreur JSON :", err));

    function initialiserSite() {
        if (appData.titreGeneral) {
            document.getElementById("main-title").textContent = appData.titreGeneral;
        }

        afficherCours();
        
        // Préparation du Quiz
        quizQuestions = melanger(appData.quizComprehension);
        currentQuizIndex = 0;
        afficherQuestionQuiz();

        // Préparation de l'Évaluation
        preparerEvaluation();
        currentEvalIndex = 0;
        afficherQuestionEval();

        ecouterEvenements();
    }

    function afficherCours() {
        const container = document.getElementById("cours-container");
        container.innerHTML = "";
        appData.cours.sections.forEach(sec => {
            const div = document.createElement("div");
            div.innerHTML = `<h3>${sec.sousTitre}</h3><p>${sec.contenu}</p>`;
            container.appendChild(div);
        });
    }

    // ==========================================
    // --- GESTION DU QUIZ ---
    // ==========================================
    function lancerMinuteurQuiz() {
        clearInterval(quizTimerInterval);
        let tempsRestant = TIMER_DURATION;
        const timerEl = document.getElementById("quiz-timer");
        timerEl.classList.remove("timer-warning");
        timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

        quizTimerInterval = setInterval(() => {
            tempsRestant--;
            timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

            if (tempsRestant <= 10) {
                timerEl.classList.add("timer-warning");
            }

            if (tempsRestant <= 0) {
                clearInterval(quizTimerInterval);
                suivantQuiz(); // Pass automatique à la question suivante
            }
        }, 1000);
    }

    function afficherQuestionQuiz() {
        if (currentQuizIndex >= quizQuestions.length) {
            terminerQuiz();
            return;
        }

        lancerMinuteurQuiz();

        // Mise à jour de la barre de progression
        const total = quizQuestions.length;
        const pct = ((currentQuizIndex + 1) / total) * 100;
        document.getElementById("quiz-progress-bar").style.width = `${pct}%`;
        document.getElementById("quiz-step-info").textContent = `Question ${currentQuizIndex + 1}/${total}`;

        const container = document.getElementById("quiz-container");
        container.innerHTML = "";

        const item = quizQuestions[currentQuizIndex];
        const qDiv = document.createElement("div");
        qDiv.className = "exercise-block";

        const options = item.options.map((opt, idx) => `
            <label class="option-label">
                <input type="radio" name="quiz_${item.id}" value="${idx}">
                ${opt.texte}
            </label>
        `).join("");

        qDiv.innerHTML = `<p><strong>${currentQuizIndex + 1}. ${item.question}</strong></p><div>${options}</div>`;
        container.appendChild(qDiv);

        const btnSuivant = document.getElementById("btn-suivant-quiz");
        btnSuivant.textContent = (currentQuizIndex === total - 1) ? "Terminer le Quiz" : "Suivant ➔";
    }

    function suivantQuiz() {
        currentQuizIndex++;
        afficherQuestionQuiz();
    }

    function terminerQuiz() {
        clearInterval(quizTimerInterval);
        document.getElementById("quiz-container").innerHTML = "<p><em>Quiz terminé ! Voici vos résultats ci-dessous :</em></p>";
        document.getElementById("btn-suivant-quiz").classList.add("hidden");
        
        // Calcul des points
        let score = 0;
        let total = quizQuestions.length;
        let feedback = [];

        quizQuestions.forEach(item => {
            const selected = document.querySelector(`input[name="quiz_${item.id}"]:checked`);
            if (selected && item.options[parseInt(selected.value)].estCorrecte) {
                score++;
            } else {
                feedback.push(`• <strong>Question "${item.question.substring(0, 30)}..." :</strong> ${item.explication}`);
            }
        });

        const box = document.getElementById("quiz-feedback");
        box.classList.remove("hidden");
        box.innerHTML = `<strong>Score final : ${score}/${total}</strong><br>${feedback.join("<br>")}`;
    }

    // ==========================================
    // --- GESTION DE L'ÉVALUATION ---
    // ==========================================
    function preparerEvaluation() {
        evalItems = [];
        appData.evaluation.forEach(ex => {
            if (ex.type === "qcm_multiple") {
                melanger(ex.questions).forEach(q => {
                    evalItems.push({ type: "qcm_multiple", titre: ex.titre, points: 1, data: q, parentEx: ex });
                });
            } else if (ex.type === "association") {
                melanger(ex.pairs).forEach(p => {
                    evalItems.push({ type: "association", titre: ex.titre, points: p.pts, data: p, parentEx: ex });
                });
            } else if (ex.type === "champs_textes") {
                melanger(ex.questionsTextes).forEach(q => {
                    evalItems.push({ type: "champs_textes", titre: ex.titre, points: q.pts, data: q, parentEx: ex });
                });
            } else if (ex.type === "analyse_avancee") {
                melanger(ex.questionsLongues).forEach(q => {
                    evalItems.push({ type: "analyse_avancee", titre: ex.titre, points: q.pts, data: q, parentEx: ex });
                });
            } else if (ex.type === "tableur") {
                melanger(ex.lignes).forEach(l => {
                    evalItems.push({ type: "tableur", titre: ex.titre, colonnes: ex.colonnes, consigne: ex.consigne, data: l, parentEx: ex });
                });
            } else if (ex.type === "tableur_classification") {
                melanger(ex.lignes).forEach(l => {
                    evalItems.push({ type: "tableur_classification", titre: ex.titre, colonnes: ex.colonnes, consigne: ex.consigne, data: l, parentEx: ex });
                });
            }
        });
    }

    function lancerMinuteurEval() {
        clearInterval(evalTimerInterval);
        let tempsRestant = TIMER_DURATION;
        const timerEl = document.getElementById("eval-timer");
        timerEl.classList.remove("timer-warning");
        timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

        evalTimerInterval = setInterval(() => {
            tempsRestant--;
            timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

            if (tempsRestant <= 10) {
                timerEl.classList.add("timer-warning");
            }

            if (tempsRestant <= 0) {
                clearInterval(evalTimerInterval);
                suivantEval(); // Passage automatique à l'élément suivant
            }
        }, 1000);
    }

    function afficherQuestionEval() {
        if (currentEvalIndex >= evalItems.length) {
            terminerEval();
            return;
        }

        lancerMinuteurEval();

        const total = evalItems.length;
        const pct = ((currentEvalIndex + 1) / total) * 100;
        document.getElementById("eval-progress-bar").style.width = `${pct}%`;
        document.getElementById("eval-step-info").textContent = `Élément ${currentEvalIndex + 1}/${total}`;

        const container = document.getElementById("eval-container");
        container.innerHTML = "";

        const item = evalItems[currentEvalIndex];
        const exDiv = document.createElement("div");
        exDiv.className = "exercise-block";

        let contentHTML = "";

        if (item.type === "qcm_multiple") {
            const q = item.data;
            contentHTML = `
                <div style="margin-top:8px;">
                    <p><strong>${q.texte}</strong></p>
                    ${q.options.map((opt, i) => `
                        <label class="option-label">
                            <input type="radio" name="${q.id}" value="${i}">
                            ${opt.texte}
                        </label>
                    `).join("")}
                </div>
            `;
        } else if (item.type === "association") {
            const p = item.data;
            contentHTML = `
                <div style="margin-top:8px;">
                    <label><strong>${p.element} :</strong></label>
                    <select name="${p.id}" class="select-input">
                        <option value="">-- Choisis une option --</option>
                        ${p.choix.map(c => `<option value="${c}">${c}</option>`).join("")}
                    </select>
                </div>
            `;
        } else if (item.type === "champs_textes" || item.type === "analyse_avancee") {
            const q = item.data;
            contentHTML = `
                <div style="margin-top:8px;">
                    <label><strong>${q.label}</strong></label>
                    <input type="text" name="${q.cle}" class="input-text" placeholder="Rédige ta réponse...">
                </div>
            `;
        } else if (item.type === "tableur") {
            const l = item.data;
            const headersHTML = item.colonnes.map(col => `<th>${col}</th>`).join("");
            contentHTML = `
                <p style="margin-bottom:8px;">${item.consigne}</p>
                <div class="tableur-wrapper">
                    <table class="tableur-custom">
                        <thead><tr>${headersHTML}</tr></thead>
                        <tbody>
                            <tr>
                                <td><strong>${l.objet}</strong></td>
                                ${l.champs.map(c => `
                                    <td>
                                        <input type="text" name="${c.cle}" class="tableur-cell-input" placeholder="Remplir...">
                                    </td>
                                `).join("")}
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        } else if (item.type === "tableur_classification") {
            const l = item.data;
            const headersHTML = item.colonnes.map(col => `<th>${col}</th>`).join("");
            contentHTML = `
                <p style="margin-bottom:8px;">${item.consigne}</p>
                <div class="tableur-wrapper">
                    <table class="tableur-custom">
                        <thead><tr>${headersHTML}</tr></thead>
                        <tbody>
                            <tr>
                                <td>${l.element}</td>
                                <td>
                                    <select name="${l.id}" class="tableur-cell-input">
                                        <option value="">-- Sélectionner --</option>
                                        <option value="Usage">Fonction d'Usage</option>
                                        <option value="Estime">Fonction d'Estime</option>
                                        <option value="Aucun">Aucun</option>
                                        <option value="Les deux">Les deux</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }

        exDiv.innerHTML = `
            <div class="exercise-header">
                <strong>${item.titre}</strong>
                <span class="tag bg-purple">${item.parentEx.niveau}</span>
            </div>
            ${contentHTML}
        `;
        container.appendChild(exDiv);

        const btnSuivant = document.getElementById("btn-suivant-eval");
        btnSuivant.textContent = (currentEvalIndex === total - 1) ? "Valider & Corriger" : "Suivant ➔";
    }

    function suivantEval() {
        currentEvalIndex++;
        afficherQuestionEval();
    }

    function terminerEval() {
        clearInterval(evalTimerInterval);
        document.getElementById("eval-container").innerHTML = "<p><em>Évaluation terminée ! Consultation de votre note ci-dessous :</em></p>";
        document.getElementById("btn-suivant-eval").classList.add("hidden");
        calculerEvaluation();
    }

    function ecouterEvenements() {
        document.getElementById("btn-suivant-quiz").addEventListener("click", () => {
            suivantQuiz();
        });

        document.getElementById("btn-suivant-eval").addEventListener("click", () => {
            suivantEval();
        });
    }

    function calculerEvaluation() {
        let scoreTotal = 0;
        let detailsHTML = "";

        appData.evaluation.forEach(ex => {
            let ptsEx = 0;
            let errs = [];

            if (ex.type === "qcm_multiple") {
                ex.questions.forEach(q => {
                    const sel = document.querySelector(`input[name="${q.id}"]:checked`);
                    if (sel && q.options[parseInt(sel.value)].estCorrecte) {
                        ptsEx += 1;
                    } else {
                        errs.push(`• <em>${q.texte}</em> $\rightarrow$ ${q.correction}`);
                    }
                });
            }
            else if (ex.type === "association") {
                ex.pairs.forEach(p => {
                    const sel = document.querySelector(`select[name="${p.id}"]`);
                    if (sel && sel.value === p.bonneReponse) {
                        ptsEx += p.pts;
                    } else {
                        errs.push(`• <em>${p.element}</em> $\rightarrow$ Attendu : <strong>${p.bonneReponse}</strong>`);
                    }
                });
            }
            else if (ex.type === "champs_textes") {
                ex.questionsTextes.forEach(q => {
                    const input = document.querySelector(`input[name="${q.cle}"]`);
                    const val = input ? input.value.toLowerCase().trim() : "";
                    const ok = q.motsCles.some(m => val.includes(m));
                    if (ok) {
                        ptsEx += q.pts;
                    } else {
                        errs.push(`• <em>${q.label}</em> $\rightarrow$ Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            }
            else if (ex.type === "analyse_avancee") {
                ex.questionsLongues.forEach(q => {
                    const input = document.querySelector(`input[name="${q.cle}"]`);
                    const val = input ? input.value.toLowerCase().trim() : "";
                    const ok = q.motsCles.some(m => val.includes(m));
                    if (ok) {
                        ptsEx += q.pts;
                    } else {
                        errs.push(`• <em>${q.label}</em> $\rightarrow$ Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            }
            else if (ex.type === "tableur") {
                ex.lignes.forEach(l => {
                    l.champs.forEach(c => {
                        const input = document.querySelector(`input[name="${c.cle}"]`);
                        const val = input ? input.value.toLowerCase().trim() : "";
                        const ok = c.motsCles.some(m => val.includes(m));
                        if (ok) {
                            ptsEx += c.pts;
                        } else {
                            errs.push(`• Tableur [${l.objet}] $\rightarrow$ Attendu : <strong>${c.reponseType}</strong>`);
                        }
                    });
                });
            }
            else if (ex.type === "tableur_classification") {
                ex.lignes.forEach(l => {
                    const sel = document.querySelector(`select[name="${l.id}"]`);
                    if (sel && sel.value === l.bonneReponse) {
                        ptsEx += l.pts;
                    } else {
                        errs.push(`• <em>${l.element}</em> $\rightarrow$ Attendu : <strong>${l.bonneReponse}</strong>`);
                    }
                });
            }

            scoreTotal += ptsEx;

            detailsHTML += `
                <div class="correction-item">
                    <h4>${ex.titre} — Note : ${Math.round(ptsEx * 100) / 100}/${ex.points}</h4>
                    ${errs.length > 0 ? errs.join("<br>") : "<p style='color:green;'>Parfait ! Tout est correct.</p>"}
                </div>
            `;
        });

        document.getElementById("note-finale").textContent = Math.round(scoreTotal);
        document.getElementById("eval-corrections-detail").innerHTML = detailsHTML;
        document.getElementById("eval-results").classList.remove("hidden");
        document.getElementById("eval-results").scrollIntoView({ behavior: "smooth" });
    }
});
Quiz de vérification rapide et

Évaluation Progressive & Grilles Tableurs (40 pts) se lancent en meme temps corrige ela pour que

Évaluation Progressive & Grilles Tableurs (40 pts) se lance une fois le quiz de verification rapide soit termine

Voici la modification du fichier script.js pour faire en sorte que l'évaluation soit masquée au démarrage, et ne commence qu'une fois le Quiz de vérification rapide terminé.

1. Modifications HTML (index.html)
Ajoutez la classe hidden sur la section de l'évaluation dans votre HTML pour la masquer par défaut au chargement de la page :

HTML
<!-- PARTIE 3 : ÉVALUATION (Masquée par défaut) -->
<section id="eval-section" class="card hidden">
    ...
</section>
2. Modifications JavaScript (script.js)
Voici le code complet du fichier script.js mis à jour :

JavaScript
document.addEventListener("DOMContentLoaded", () => {
    let appData = null;

    // Mélange Fisher-Yates
    function melanger(array) {
        let copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // --- VARIABLES DE GESTION DU PARENT/STEPPER ---
    let quizQuestions = [];
    let currentQuizIndex = 0;
    let quizTimerInterval = null;

    let evalItems = [];
    let currentEvalIndex = 0;
    let evalTimerInterval = null;

    const TIMER_DURATION = 60; // 60 secondes par question

    fetch("questions.json")
        .then(res => res.json())
        .then(data => {
            appData = data;
            initialiserSite();
        })
        .catch(err => console.error("Erreur JSON :", err));

    function initialiserSite() {
        if (appData.titreGeneral) {
            document.getElementById("main-title").textContent = appData.titreGeneral;
        }

        afficherCours();
        
        // Démarrage du Quiz uniquement au lancement
        quizQuestions = melanger(appData.quizComprehension);
        currentQuizIndex = 0;
        afficherQuestionQuiz();

        // Préparation de l'Évaluation (Sera affichée plus tard)
        preparerEvaluation();

        ecouterEvenements();
    }

    function afficherCours() {
        const container = document.getElementById("cours-container");
        container.innerHTML = "";
        appData.cours.sections.forEach(sec => {
            const div = document.createElement("div");
            div.innerHTML = `<h3>${sec.sousTitre}</h3><p>${sec.contenu}</p>`;
            container.appendChild(div);
        });
    }

    // ==========================================
    // --- GESTION DU QUIZ ---
    // ==========================================
    function lancerMinuteurQuiz() {
        clearInterval(quizTimerInterval);
        let tempsRestant = TIMER_DURATION;
        const timerEl = document.getElementById("quiz-timer");
        timerEl.classList.remove("timer-warning");
        timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

        quizTimerInterval = setInterval(() => {
            tempsRestant--;
            timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

            if (tempsRestant <= 10) {
                timerEl.classList.add("timer-warning");
            }

            if (tempsRestant <= 0) {
                clearInterval(quizTimerInterval);
                suivantQuiz();
            }
        }, 1000);
    }

    function afficherQuestionQuiz() {
        if (currentQuizIndex >= quizQuestions.length) {
            terminerQuiz();
            return;
        }

        lancerMinuteurQuiz();

        const total = quizQuestions.length;
        const pct = ((currentQuizIndex + 1) / total) * 100;
        document.getElementById("quiz-progress-bar").style.width = `${pct}%`;
        document.getElementById("quiz-step-info").textContent = `Question ${currentQuizIndex + 1}/${total}`;

        const container = document.getElementById("quiz-container");
        container.innerHTML = "";

        const item = quizQuestions[currentQuizIndex];
        const qDiv = document.createElement("div");
        qDiv.className = "exercise-block";

        const options = item.options.map((opt, idx) => `
            <label class="option-label">
                <input type="radio" name="quiz_${item.id}" value="${idx}">
                ${opt.texte}
            </label>
        `).join("");

        qDiv.innerHTML = `<p><strong>${currentQuizIndex + 1}. ${item.question}</strong></p><div>${options}</div>`;
        container.appendChild(qDiv);

        const btnSuivant = document.getElementById("btn-suivant-quiz");
        btnSuivant.textContent = (currentQuizIndex === total - 1) ? "Terminer le Quiz" : "Suivant ➔";
    }

    function suivantQuiz() {
        currentQuizIndex++;
        afficherQuestionQuiz();
    }

    function terminerQuiz() {
        clearInterval(quizTimerInterval);
        document.getElementById("quiz-container").innerHTML = "<p><em>Quiz terminé ! Résultats ci-dessous :</em></p>";
        document.getElementById("btn-suivant-quiz").classList.add("hidden");
        
        let score = 0;
        let total = quizQuestions.length;
        let feedback = [];

        quizQuestions.forEach(item => {
            const selected = document.querySelector(`input[name="quiz_${item.id}"]:checked`);
            if (selected && item.options[parseInt(selected.value)].estCorrecte) {
                score++;
            } else {
                feedback.push(`• <strong>Question "${item.question.substring(0, 30)}..." :</strong> ${item.explication}`);
            }
        });

        const box = document.getElementById("quiz-feedback");
        box.classList.remove("hidden");
        box.innerHTML = `<strong>Score final : ${score}/${total}</strong><br>${feedback.join("<br>")}`;

        // --- DÉCLENCHEMENT DE L'ÉVALUATION ---
        lancerEvaluation();
    }

    // ==========================================
    // --- GESTION DE L'ÉVALUATION ---
    // ==========================================
    function preparerEvaluation() {
        evalItems = [];
        appData.evaluation.forEach(ex => {
            if (ex.type === "qcm_multiple") {
                melanger(ex.questions).forEach(q => {
                    evalItems.push({ type: "qcm_multiple", titre: ex.titre, points: 1, data: q, parentEx: ex });
                });
            } else if (ex.type === "association") {
                melanger(ex.pairs).forEach(p => {
                    evalItems.push({ type: "association", titre: ex.titre, points: p.pts, data: p, parentEx: ex });
                });
            } else if (ex.type === "champs_textes") {
                melanger(ex.questionsTextes).forEach(q => {
                    evalItems.push({ type: "champs_textes", titre: ex.titre, points: q.pts, data: q, parentEx: ex });
                });
            } else if (ex.type === "analyse_avancee") {
                melanger(ex.questionsLongues).forEach(q => {
                    evalItems.push({ type: "analyse_avancee", titre: ex.titre, points: q.pts, data: q, parentEx: ex });
                });
            } else if (ex.type === "tableur") {
                melanger(ex.lignes).forEach(l => {
                    evalItems.push({ type: "tableur", titre: ex.titre, colonnes: ex.colonnes, consigne: ex.consigne, data: l, parentEx: ex });
                });
            } else if (ex.type === "tableur_classification") {
                melanger(ex.lignes).forEach(l => {
                    evalItems.push({ type: "tableur_classification", titre: ex.titre, colonnes: ex.colonnes, consigne: ex.consigne, data: l, parentEx: ex });
                });
            }
        });
    }

    function lancerEvaluation() {
        const evalSection = document.getElementById("eval-section");
        if (evalSection) {
            evalSection.classList.remove("hidden");
            evalSection.scrollIntoView({ behavior: "smooth" });
        }
        currentEvalIndex = 0;
        afficherQuestionEval();
    }

    function lancerMinuteurEval() {
        clearInterval(evalTimerInterval);
        let tempsRestant = TIMER_DURATION;
        const timerEl = document.getElementById("eval-timer");
        timerEl.classList.remove("timer-warning");
        timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

        evalTimerInterval = setInterval(() => {
            tempsRestant--;
            timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

            if (tempsRestant <= 10) {
                timerEl.classList.add("timer-warning");
            }

            if (tempsRestant <= 0) {
                clearInterval(evalTimerInterval);
                suivantEval();
            }
        }, 1000);
    }

    function afficherQuestionEval() {
        if (currentEvalIndex >= evalItems.length) {
            terminerEval();
            return;
        }

        lancerMinuteurEval();

        const total = evalItems.length;
        const pct = ((currentEvalIndex + 1) / total) * 100;
        document.getElementById("eval-progress-bar").style.width = `${pct}%`;
        document.getElementById("eval-step-info").textContent = `Élément ${currentEvalIndex + 1}/${total}`;

        const container = document.getElementById("eval-container");
        container.innerHTML = "";

        const item = evalItems[currentEvalIndex];
        const exDiv = document.createElement("div");
        exDiv.className = "exercise-block";

        let contentHTML = "";

        if (item.type === "qcm_multiple") {
            const q = item.data;
            contentHTML = `
                <div style="margin-top:8px;">
                    <p><strong>${q.texte}</strong></p>
                    ${q.options.map((opt, i) => `
                        <label class="option-label">
                            <input type="radio" name="${q.id}" value="${i}">
                            ${opt.texte}
                        </label>
                    `).join("")}
                </div>
            `;
        } else if (item.type === "association") {
            const p = item.data;
            contentHTML = `
                <div style="margin-top:8px;">
                    <label><strong>${p.element} :</strong></label>
                    <select name="${p.id}" class="select-input">
                        <option value="">-- Choisis une option --</option>
                        ${p.choix.map(c => `<option value="${c}">${c}</option>`).join("")}
                    </select>
                </div>
            `;
        } else if (item.type === "champs_textes" || item.type === "analyse_avancee") {
            const q = item.data;
            contentHTML = `
                <div style="margin-top:8px;">
                    <label><strong>${q.label}</strong></label>
                    <input type="text" name="${q.cle}" class="input-text" placeholder="Rédige ta réponse...">
                </div>
            `;
        } else if (item.type === "tableur") {
            const l = item.data;
            const headersHTML = item.colonnes.map(col => `<th>${col}</th>`).join("");
            contentHTML = `
                <p style="margin-bottom:8px;">${item.consigne}</p>
                <div class="tableur-wrapper">
                    <table class="tableur-custom">
                        <thead><tr>${headersHTML}</tr></thead>
                        <tbody>
                            <tr>
                                <td><strong>${l.objet}</strong></td>
                                ${l.champs.map(c => `
                                    <td>
                                        <input type="text" name="${c.cle}" class="tableur-cell-input" placeholder="Remplir...">
                                    </td>
                                `).join("")}
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        } else if (item.type === "tableur_classification") {
            const l = item.data;
            const headersHTML = item.colonnes.map(col => `<th>${col}</th>`).join("");
            contentHTML = `
                <p style="margin-bottom:8px;">${item.consigne}</p>
                <div class="tableur-wrapper">
                    <table class="tableur-custom">
                        <thead><tr>${headersHTML}</tr></thead>
                        <tbody>
                            <tr>
                                <td>${l.element}</td>
                                <td>
                                    <select name="${l.id}" class="tableur-cell-input">
                                        <option value="">-- Sélectionner --</option>
                                        <option value="Usage">Fonction d'Usage</option>
                                        <option value="Estime">Fonction d'Estime</option>
                                        <option value="Aucun">Aucun</option>
                                        <option value="Les deux">Les deux</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }

        exDiv.innerHTML = `
            <div class="exercise-header">
                <strong>${item.titre}</strong>
                <span class="tag bg-purple">${item.parentEx.niveau}</span>
            </div>
            ${contentHTML}
        `;
        container.appendChild(exDiv);

        const btnSuivant = document.getElementById("btn-suivant-eval");
        btnSuivant.textContent = (currentEvalIndex === total - 1) ? "Valider & Corriger" : "Suivant ➔";
    }

    function suivantEval() {
        currentEvalIndex++;
        afficherQuestionEval();
    }

    function terminerEval() {
        clearInterval(evalTimerInterval);
        document.getElementById("eval-container").innerHTML = "<p><em>Évaluation terminée ! Consultation de votre note ci-dessous :</em></p>";
        document.getElementById("btn-suivant-eval").classList.add("hidden");
        calculerEvaluation();
    }

    function ecouterEvenements() {
        document.getElementById("btn-suivant-quiz").addEventListener("click", () => {
            suivantQuiz();
        });

        document.getElementById("btn-suivant-eval").addEventListener("click", () => {
            suivantEval();
        });
    }

    function calculerEvaluation() {
        let scoreTotal = 0;
        let detailsHTML = "";

        appData.evaluation.forEach(ex => {
            let ptsEx = 0;
            let errs = [];

            if (ex.type === "qcm_multiple") {
                ex.questions.forEach(q => {
                    const sel = document.querySelector(`input[name="${q.id}"]:checked`);
                    if (sel && q.options[parseInt(sel.value)].estCorrecte) {
                        ptsEx += 1;
                    } else {
                        errs.push(`• <em>${q.texte}</em> $\rightarrow$ ${q.correction}`);
                    }
                });
            }
            else if (ex.type === "association") {
                ex.pairs.forEach(p => {
                    const sel = document.querySelector(`select[name="${p.id}"]`);
                    if (sel && sel.value === p.bonneReponse) {
                        ptsEx += p.pts;
                    } else {
                        errs.push(`• <em>${p.element}</em> $\rightarrow$ Attendu : <strong>${p.bonneReponse}</strong>`);
                    }
                });
            }
            else if (ex.type === "champs_textes") {
                ex.questionsTextes.forEach(q => {
                    const input = document.querySelector(`input[name="${q.cle}"]`);
                    const val = input ? input.value.toLowerCase().trim() : "";
                    const ok = q.motsCles.some(m => val.includes(m));
                    if (ok) {
                        ptsEx += q.pts;
                    } else {
                        errs.push(`• <em>${q.label}</em> $\rightarrow$ Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            }
            else if (ex.type === "analyse_avancee") {
                ex.questionsLongues.forEach(q => {
                    const input = document.querySelector(`input[name="${q.cle}"]`);
                    const val = input ? input.value.toLowerCase().trim() : "";
                    const ok = q.motsCles.some(m => val.includes(m));
                    if (ok) {
                        ptsEx += q.pts;
                    } else {
                        errs.push(`• <em>${q.label}</em> $\rightarrow$ Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            }
            else if (ex.type === "tableur") {
                ex.lignes.forEach(l => {
                    l.champs.forEach(c => {
                        const input = document.querySelector(`input[name="${c.cle}"]`);
                        const val = input ? input.value.toLowerCase().trim() : "";
                        const ok = c.motsCles.some(m => val.includes(m));
                        if (ok) {
                            ptsEx += c.pts;
                        } else {
                            errs.push(`• Tableur [${l.objet}] $\rightarrow$ Attendu : <strong>${c.reponseType}</strong>`);
                        }
                    });
                });
            }
            else if (ex.type === "tableur_classification") {
                ex.lignes.forEach(l => {
                    const sel = document.querySelector(`select[name="${l.id}"]`);
                    if (sel && sel.value === l.bonneReponse) {
                        ptsEx += l.pts;
                    } else {
                        errs.push(`• <em>${l.element}</em> $\rightarrow$ Attendu : <strong>${l.bonneReponse}</strong>`);
                    }
                });
            }

            scoreTotal += ptsEx;

            detailsHTML += `
                <div class="correction-item">
                    <h4>${ex.titre} — Note : ${Math.round(ptsEx * 100) / 100}/${ex.points}</h4>
                    ${errs.length > 0 ? errs.join("<br>") : "<p style='color:green;'>Parfait ! Tout est correct.</p>"}
                </div>
            `;
        });

        document.getElementById("note-finale").textContent = Math.round(scoreTotal);
        document.getElementById("eval-corrections-detail").innerHTML = detailsHTML;
        document.getElementById("eval-results").classList.remove("hidden");
        document.getElementById("eval-results").scrollIntoView({ behavior: "smooth" });
    }
});
ameliore le programme pourqu'a la fin du questionnaire Évaluation Progressive & Grilles Tableurs (40 pts) une page pdf des resultats soit affichée

Votre archive avec les fichiers mis à jour est prête :
Icône ZIP
Module_Technologie_3eme_PDF
 ZIP 
Ouvert

🛠️ Modifications & Améliorations Apportées :
Inclusion de la bibliothèque PDF (html2pdf.js) :

Ajout de la bibliothèque CDN html2pdf.bundle.min.js dans le fichier index.html pour permettre une génération rapide et propre en un clic sans rechargement.

Zone de Rapport PDF dédiée (#pdf-report-area) :

Structuration de la section des résultats sous forme de bilan imprimable (En-tête avec titre de l'évaluation, date et heure du passage, note globale sur 40, et détail complet des corrections).

Génération & Téléchargement Automatique :

Dès que la dernière question de l'évaluation est validée, le score est calculé et le téléchargement du fichier PDF (Resultats_Evaluation_Technologie_3eme.pdf) est automatiquement déclenché.

Un bouton "📄 Télécharger / Afficher le Rapport PDF" permet également de ré-exporter ou de consulter le document PDF à tout moment.

📁 Fichiers inclus dans le projet :
index.html : 
Icône HTML
app_updated/index
 HTML 
Ouvert

script.js : 
Icône JS
app_updated/script
 JS 
Ouvert

style.css : 
Icône CSS
app_updated/style
 CSS 
Ouvert




Gemini est une IA et peut se tromper, y compris sur des personnes. Votre confidentialité et GeminiS'ouvre dans une nouvelle fenêtre


document.addEventListener("DOMContentLoaded", () => {
    let appData = null;

    // Mélange Fisher-Yates
    function melanger(array) {
        let copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // --- VARIABLES DE GESTION ---
    let quizQuestions = [];
    let currentQuizIndex = 0;
    let quizTimerInterval = null;

    let evalItems = [];
    let currentEvalIndex = 0;
    let evalTimerInterval = null;

    const TIMER_DURATION = 60; // 60 secondes par question

    fetch("questions.json")
        .then(res => res.json())
        .then(data => {
            appData = data;
            initialiserSite();
        })
        .catch(err => console.error("Erreur JSON :", err));

    function initialiserSite() {
        if (appData.titreGeneral) {
            document.getElementById("main-title").textContent = appData.titreGeneral;
        }

        afficherCours();
        
        // Démarrage du Quiz
        quizQuestions = melanger(appData.quizComprehension);
        currentQuizIndex = 0;
        afficherQuestionQuiz();

        // Préparation de l'Évaluation
        preparerEvaluation();

        ecouterEvenements();
    }

    function afficherCours() {
        const container = document.getElementById("cours-container");
        container.innerHTML = "";
        appData.cours.sections.forEach(sec => {
            const div = document.createElement("div");
            div.innerHTML = `<h3>${sec.sousTitre}</h3><p>${sec.contenu}</p>`;
            container.appendChild(div);
        });
    }

    // ==========================================
    // --- GESTION DU QUIZ ---
    // ==========================================
    function lancerMinuteurQuiz() {
        clearInterval(quizTimerInterval);
        let tempsRestant = TIMER_DURATION;
        const timerEl = document.getElementById("quiz-timer");
        timerEl.classList.remove("timer-warning");
        timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

        quizTimerInterval = setInterval(() => {
            tempsRestant--;
            timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

            if (tempsRestant <= 10) {
                timerEl.classList.add("timer-warning");
            }

            if (tempsRestant <= 0) {
                clearInterval(quizTimerInterval);
                suivantQuiz();
            }
        }, 1000);
    }

    function afficherQuestionQuiz() {
        if (currentQuizIndex >= quizQuestions.length) {
            terminerQuiz();
            return;
        }

        lancerMinuteurQuiz();

        const total = quizQuestions.length;
        const pct = ((currentQuizIndex + 1) / total) * 100;
        document.getElementById("quiz-progress-bar").style.width = `${pct}%`;
        document.getElementById("quiz-step-info").textContent = `Question ${currentQuizIndex + 1}/${total}`;

        const container = document.getElementById("quiz-container");
        container.innerHTML = "";

        const item = quizQuestions[currentQuizIndex];
        const qDiv = document.createElement("div");
        qDiv.className = "exercise-block";

        const options = item.options.map((opt, idx) => `
            <label class="option-label">
                <input type="radio" name="quiz_${item.id}" value="${idx}">
                ${opt.texte}
            </label>
        `).join("");

        qDiv.innerHTML = `<p><strong>${currentQuizIndex + 1}. ${item.question}</strong></p><div>${options}</div>`;
        container.appendChild(qDiv);

        const btnSuivant = document.getElementById("btn-suivant-quiz");
        btnSuivant.textContent = (currentQuizIndex === total - 1) ? "Terminer le Quiz" : "Suivant ➔";
    }

    function suivantQuiz() {
        currentQuizIndex++;
        afficherQuestionQuiz();
    }

    function terminerQuiz() {
        clearInterval(quizTimerInterval);
        document.getElementById("quiz-container").innerHTML = "<p><em>Quiz terminé ! Résultats ci-dessous :</em></p>";
        document.getElementById("btn-suivant-quiz").classList.add("hidden");
        
        let score = 0;
        let total = quizQuestions.length;
        let feedback = [];

        quizQuestions.forEach(item => {
            const selected = document.querySelector(`input[name="quiz_${item.id}"]:checked`);
            if (selected && item.options[parseInt(selected.value)].estCorrecte) {
                score++;
            } else {
                feedback.push(`• <strong>Question "${item.question.substring(0, 30)}..." :</strong> ${item.explication}`);
            }
        });

        const box = document.getElementById("quiz-feedback");
        box.classList.remove("hidden");
        box.innerHTML = `<strong>Score final : ${score}/${total}</strong><br>${feedback.join("<br>")}`;

        // Lancement de l'Évaluation
        lancerEvaluation();
    }

    // ==========================================
    // --- GESTION DE L'ÉVALUATION ---
    // ==========================================
    function preparerEvaluation() {
        evalItems = [];
        appData.evaluation.forEach(ex => {
            if (ex.type === "qcm_multiple") {
                melanger(ex.questions).forEach(q => {
                    evalItems.push({ type: "qcm_multiple", titre: ex.titre, points: 1, data: q, parentEx: ex });
                });
            } else if (ex.type === "association") {
                melanger(ex.pairs).forEach(p => {
                    evalItems.push({ type: "association", titre: ex.titre, points: p.pts, data: p, parentEx: ex });
                });
            } else if (ex.type === "champs_textes") {
                melanger(ex.questionsTextes).forEach(q => {
                    evalItems.push({ type: "champs_textes", titre: ex.titre, points: q.pts, data: q, parentEx: ex });
                });
            } else if (ex.type === "analyse_avancee") {
                melanger(ex.questionsLongues).forEach(q => {
                    evalItems.push({ type: "analyse_avancee", titre: ex.titre, points: q.pts, data: q, parentEx: ex });
                });
            } else if (ex.type === "tableur") {
                melanger(ex.lignes).forEach(l => {
                    evalItems.push({ type: "tableur", titre: ex.titre, colonnes: ex.colonnes, consigne: ex.consigne, data: l, parentEx: ex });
                });
            } else if (ex.type === "tableur_classification") {
                melanger(ex.lignes).forEach(l => {
                    evalItems.push({ type: "tableur_classification", titre: ex.titre, colonnes: ex.colonnes, consigne: ex.consigne, data: l, parentEx: ex });
                });
            }
        });
    }

    function lancerEvaluation() {
        const evalSection = document.getElementById("eval-section");
        if (evalSection) {
            evalSection.classList.remove("hidden");
            evalSection.scrollIntoView({ behavior: "smooth" });
        }
        currentEvalIndex = 0;
        afficherQuestionEval();
    }

    function lancerMinuteurEval() {
        clearInterval(evalTimerInterval);
        let tempsRestant = TIMER_DURATION;
        const timerEl = document.getElementById("eval-timer");
        timerEl.classList.remove("timer-warning");
        timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

        evalTimerInterval = setInterval(() => {
            tempsRestant--;
            timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

            if (tempsRestant <= 10) {
                timerEl.classList.add("timer-warning");
            }

            if (tempsRestant <= 0) {
                clearInterval(evalTimerInterval);
                suivantEval();
            }
        }, 1000);
    }

    function afficherQuestionEval() {
        if (currentEvalIndex >= evalItems.length) {
            terminerEval();
            return;
        }

        lancerMinuteurEval();

        const total = evalItems.length;
        const pct = ((currentEvalIndex + 1) / total) * 100;
        document.getElementById("eval-progress-bar").style.width = `${pct}%`;
        document.getElementById("eval-step-info").textContent = `Élément ${currentEvalIndex + 1}/${total}`;

        const container = document.getElementById("eval-container");
        container.innerHTML = "";

        const item = evalItems[currentEvalIndex];
        const exDiv = document.createElement("div");
        exDiv.className = "exercise-block";

        let contentHTML = "";

        if (item.type === "qcm_multiple") {
            const q = item.data;
            contentHTML = `
                <div style="margin-top:8px;">
                    <p><strong>${q.texte}</strong></p>
                    ${q.options.map((opt, i) => `
                        <label class="option-label">
                            <input type="radio" name="${q.id}" value="${i}">
                            ${opt.texte}
                        </label>
                    `).join("")}
                </div>
            `;
        } else if (item.type === "association") {
            const p = item.data;
            contentHTML = `
                <div style="margin-top:8px;">
                    <label><strong>${p.element} :</strong></label>
                    <select name="${p.id}" class="select-input">
                        <option value="">-- Choisis une option --</option>
                        ${p.choix.map(c => `<option value="${c}">${c}</option>`).join("")}
                    </select>
                </div>
            `;
        } else if (item.type === "champs_textes" || item.type === "analyse_avancee") {
            const q = item.data;
            contentHTML = `
                <div style="margin-top:8px;">
                    <label><strong>${q.label}</strong></label>
                    <input type="text" name="${q.cle}" class="input-text" placeholder="Rédige ta réponse...">
                </div>
            `;
        } else if (item.type === "tableur") {
            const l = item.data;
            const headersHTML = item.colonnes.map(col => `<th>${col}</th>`).join("");
            contentHTML = `
                <p style="margin-bottom:8px;">${item.consigne}</p>
                <div class="tableur-wrapper">
                    <table class="tableur-custom">
                        <thead><tr>${headersHTML}</tr></thead>
                        <tbody>
                            <tr>
                                <td><strong>${l.objet}</strong></td>
                                ${l.champs.map(c => `
                                    <td>
                                        <input type="text" name="${c.cle}" class="tableur-cell-input" placeholder="Remplir...">
                                    </td>
                                `).join("")}
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        } else if (item.type === "tableur_classification") {
            const l = item.data;
            const headersHTML = item.colonnes.map(col => `<th>${col}</th>`).join("");
            contentHTML = `
                <p style="margin-bottom:8px;">${item.consigne}</p>
                <div class="tableur-wrapper">
                    <table class="tableur-custom">
                        <thead><tr>${headersHTML}</tr></thead>
                        <tbody>
                            <tr>
                                <td>${l.element}</td>
                                <td>
                                    <select name="${l.id}" class="tableur-cell-input">
                                        <option value="">-- Sélectionner --</option>
                                        <option value="Usage">Fonction d'Usage</option>
                                        <option value="Estime">Fonction d'Estime</option>
                                        <option value="Aucun">Aucun</option>
                                        <option value="Les deux">Les deux</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }

        exDiv.innerHTML = `
            <div class="exercise-header">
                <strong>${item.titre}</strong>
                <span class="tag bg-purple">${item.parentEx.niveau}</span>
            </div>
            ${contentHTML}
        `;
        container.appendChild(exDiv);

        const btnSuivant = document.getElementById("btn-suivant-eval");
        btnSuivant.textContent = (currentEvalIndex === total - 1) ? "Valider & Corriger" : "Suivant ➔";
    }

    function suivantEval() {
        currentEvalIndex++;
        afficherQuestionEval();
    }

    function terminerEval() {
        clearInterval(evalTimerInterval);
        document.getElementById("eval-container").innerHTML = "<p><em>Évaluation terminée ! Consultation de votre note ci-dessous :</em></p>";
        document.getElementById("btn-suivant-eval").classList.add("hidden");
        calculerEvaluation();
        
        // Génération automatique / affichage du PDF
        genererPDFResultats();
    }

    function ecouterEvenements() {
        document.getElementById("btn-suivant-quiz").addEventListener("click", () => {
            suivantQuiz();
        });

        document.getElementById("btn-suivant-eval").addEventListener("click", () => {
            suivantEval();
        });

        document.getElementById("btn-telecharger-pdf").addEventListener("click", () => {
            genererPDFResultats();
        });
    }

    function calculerEvaluation() {
        let scoreTotal = 0;
        let detailsHTML = "";

        appData.evaluation.forEach(ex => {
            let ptsEx = 0;
            let errs = [];

            if (ex.type === "qcm_multiple") {
                ex.questions.forEach(q => {
                    const sel = document.querySelector(`input[name="${q.id}"]:checked`);
                    if (sel && q.options[parseInt(sel.value)].estCorrecte) {
                        ptsEx += 1;
                    } else {
                        errs.push(`• <em>${q.texte}</em> $\rightarrow$ ${q.correction}`);
                    }
                });
            }
            else if (ex.type === "association") {
                ex.pairs.forEach(p => {
                    const sel = document.querySelector(`select[name="${p.id}"]`);
                    if (sel && sel.value === p.bonneReponse) {
                        ptsEx += p.pts;
                    } else {
                        errs.push(`• <em>${p.element}</em> $\rightarrow$ Attendu : <strong>${p.bonneReponse}</strong>`);
                    }
                });
            }
            else if (ex.type === "champs_textes") {
                ex.questionsTextes.forEach(q => {
                    const input = document.querySelector(`input[name="${q.cle}"]`);
                    const val = input ? input.value.toLowerCase().trim() : "";
                    const ok = q.motsCles.some(m => val.includes(m));
                    if (ok) {
                        ptsEx += q.pts;
                    } else {
                        errs.push(`• <em>${q.label}</em> $\rightarrow$ Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            }
            else if (ex.type === "analyse_avancee") {
                ex.questionsLongues.forEach(q => {
                    const input = document.querySelector(`input[name="${q.cle}"]`);
                    const val = input ? input.value.toLowerCase().trim() : "";
                    const ok = q.motsCles.some(m => val.includes(m));
                    if (ok) {
                        ptsEx += q.pts;
                    } else {
                        errs.push(`• <em>${q.label}</em> $\rightarrow$ Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            }
            else if (ex.type === "tableur") {
                ex.lignes.forEach(l => {
                    l.champs.forEach(c => {
                        const input = document.querySelector(`input[name="${c.cle}"]`);
                        const val = input ? input.value.toLowerCase().trim() : "";
                        const ok = c.motsCles.some(m => val.includes(m));
                        if (ok) {
                            ptsEx += c.pts;
                        } else {
                            errs.push(`• Tableur [${l.objet}] $\rightarrow$ Attendu : <strong>${c.reponseType}</strong>`);
                        }
                    });
                });
            }
            else if (ex.type === "tableur_classification") {
                ex.lignes.forEach(l => {
                    const sel = document.querySelector(`select[name="${l.id}"]`);
                    if (sel && sel.value === l.bonneReponse) {
                        ptsEx += l.pts;
                    } else {
                        errs.push(`• <em>${l.element}</em> $\rightarrow$ Attendu : <strong>${l.bonneReponse}</strong>`);
                    }
                });
            }

            scoreTotal += ptsEx;

            detailsHTML += `
                <div class="correction-item">
                    <h4>${ex.titre} — Note : ${Math.round(ptsEx * 100) / 100}/${ex.points}</h4>
                    ${errs.length > 0 ? errs.join("<br>") : "<p style='color:green;'>Parfait ! Tout est correct.</p>"}
                </div>
            `;
        });

        const mainteant = new Date();
        document.getElementById("pdf-date").textContent = "Réalisé le : " + mainteant.toLocaleDateString("fr-FR") + " à " + mainteant.toLocaleTimeString("fr-FR");
        document.getElementById("note-finale").textContent = Math.round(scoreTotal);
        document.getElementById("eval-corrections-detail").innerHTML = detailsHTML;
        document.getElementById("eval-results").classList.remove("hidden");
        document.getElementById("eval-results").scrollIntoView({ behavior: "smooth" });
    }

    // ==========================================
    // --- GESTION DE LA GÉNÉRATION PDF ---
    // ==========================================
    function genererPDFResultats() {
        const element = document.getElementById("pdf-report-area");
        
        const opt = {
            margin:       10,
            filename:     'Resultats_Evaluation_Technologie_3eme.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        if (window.html2pdf) {
            html2pdf().set(opt).from(element).save();
        } else {
            window.print();
        }
    }
});
app_updated/script.js
Affichage de app_updated/script.js.
