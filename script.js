document.addEventListener("DOMContentLoaded", () => {
    let appData = null;

    // --- VARIABLES DE GESTION ---
    let quizQuestions = [];
    let currentQuizIndex = 0;
    let quizTimerInterval = null;

    let evalItems = [];
    let currentEvalIndex = 0;
    let evalTimerInterval = null;

    // Stockage des réponses utilisateur pour le calcul final
    const userAnswers = {};

    const QUIZ_TIMER_DURATION = 60;   // 60s pour les QCM rapides
    const EVAL_TIMER_DURATION = 180;  // 180s pour laisser le temps de remplir les tableurs

    // Mélange Fisher-Yates
    function melanger(array) {
        let copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    fetch("questions.json")
        .then(res => res.json())
        .then(data => {
            appData = data;
            initialiserSite();
        })
        .catch(err => console.error("Erreur JSON :", err));

    function initialiserSite() {
        if (appData.titreGeneral) {
            const titleEl = document.getElementById("main-title");
            if (titleEl) titleEl.textContent = appData.titreGeneral;
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
        if (!container) return;
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
        let tempsRestant = QUIZ_TIMER_DURATION;
        const timerEl = document.getElementById("quiz-timer");
        if (!timerEl) return;
        
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
                sauvegarderReponseQuizCourante();
                suivantQuiz();
            }
        }, 1000);
    }

    function sauvegarderReponseQuizCourante() {
        const item = quizQuestions[currentQuizIndex];
        if (!item) return;
        const sel = document.querySelector(`input[name="quiz_${item.id}"]:checked`);
        userAnswers[`quiz_${item.id}`] = sel ? sel.value : null;
    }

    function afficherQuestionQuiz() {
        if (currentQuizIndex >= quizQuestions.length) {
            terminerQuiz();
            return;
        }

        lancerMinuteurQuiz();

        const total = quizQuestions.length;
        const pct = ((currentQuizIndex + 1) / total) * 100;
        
        const progressBar = document.getElementById("quiz-progress-bar");
        if (progressBar) progressBar.style.width = `${pct}%`;
        
        const stepInfo = document.getElementById("quiz-step-info");
        if (stepInfo) stepInfo.textContent = `Question ${currentQuizIndex + 1}/${total}`;

        const container = document.getElementById("quiz-container");
        if (!container) return;
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
        if (btnSuivant) {
            btnSuivant.textContent = (currentQuizIndex === total - 1) ? "Terminer le Quiz" : "Suivant ➔";
        }
    }

    function suivantQuiz() {
        sauvegarderReponseQuizCourante();
        currentQuizIndex++;
        afficherQuestionQuiz();
    }

    function terminerQuiz() {
        clearInterval(quizTimerInterval);
        const container = document.getElementById("quiz-container");
        if (container) container.innerHTML = "<p><em>Quiz terminé ! Résultats ci-dessous :</em></p>";
        
        const btnSuivant = document.getElementById("btn-suivant-quiz");
        if (btnSuivant) btnSuivant.classList.add("hidden");
        
        let score = 0;
        let total = quizQuestions.length;
        let feedback = [];

        quizQuestions.forEach(item => {
            const val = userAnswers[`quiz_${item.id}`];
            if (val !== null && val !== undefined && item.options[parseInt(val)].estCorrecte) {
                score++;
            } else {
                feedback.push(`• <strong>Question "${item.question.substring(0, 35)}..." :</strong> ${item.explication}`);
            }
        });

        const box = document.getElementById("quiz-feedback");
        if (box) {
            box.classList.remove("hidden");
            box.innerHTML = `<strong>Score final : ${score}/${total}</strong><br>${feedback.join("<br>")}`;
        }

        // Lancement automatique de l'Évaluation
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
        let tempsRestant = EVAL_TIMER_DURATION;
        const timerEl = document.getElementById("eval-timer");
        if (!timerEl) return;

        timerEl.classList.remove("timer-warning");
        timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

        evalTimerInterval = setInterval(() => {
            tempsRestant--;
            timerEl.textContent = `⏱️ Temps restant : ${tempsRestant}s`;

            if (tempsRestant <= 15) {
                timerEl.classList.add("timer-warning");
            }

            if (tempsRestant <= 0) {
                clearInterval(evalTimerInterval);
                sauvegarderReponseEvalCourante();
                suivantEval();
            }
        }, 1000);
    }

    function sauvegarderReponseEvalCourante() {
        const item = evalItems[currentEvalIndex];
        if (!item) return;

        if (item.type === "qcm_multiple") {
            const sel = document.querySelector(`input[name="${item.data.id}"]:checked`);
            userAnswers[item.data.id] = sel ? sel.value : "";
        } else if (item.type === "association") {
            const sel = document.querySelector(`select[name="${item.data.id}"]`);
            userAnswers[item.data.id] = sel ? sel.value : "";
        } else if (item.type === "champs_textes" || item.type === "analyse_avancee") {
            const input = document.querySelector(`input[name="${item.data.cle}"]`);
            userAnswers[item.data.cle] = input ? input.value : "";
        } else if (item.type === "tableur") {
            item.data.champs.forEach(c => {
                const input = document.querySelector(`input[name="${c.cle}"]`);
                userAnswers[c.cle] = input ? input.value : "";
            });
        } else if (item.type === "tableur_classification") {
            const sel = document.querySelector(`select[name="${item.data.id}"]`);
            userAnswers[item.data.id] = sel ? sel.value : "";
        }
    }

    function afficherQuestionEval() {
        if (currentEvalIndex >= evalItems.length) {
            terminerEval();
            return;
        }

        lancerMinuteurEval();

        const total = evalItems.length;
        const pct = ((currentEvalIndex + 1) / total) * 100;
        
        const progressBar = document.getElementById("eval-progress-bar");
        if (progressBar) progressBar.style.width = `${pct}%`;
        
        const stepInfo = document.getElementById("eval-step-info");
        if (stepInfo) stepInfo.textContent = `Élément ${currentEvalIndex + 1}/${total}`;

        const container = document.getElementById("eval-container");
        if (!container) return;
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
        if (btnSuivant) {
            btnSuivant.textContent = (currentEvalIndex === total - 1) ? "Valider & Corriger" : "Suivant ➔";
        }
    }

    function suivantEval() {
        sauvegarderReponseEvalCourante();
        currentEvalIndex++;
        afficherQuestionEval();
    }

    function terminerEval() {
        clearInterval(evalTimerInterval);
        const container = document.getElementById("eval-container");
        if (container) container.innerHTML = "<p><em>Évaluation terminée ! Consultation de votre note ci-dessous :</em></p>";
        
        const btnSuivant = document.getElementById("btn-suivant-eval");
        if (btnSuivant) btnSuivant.classList.add("hidden");
        
        calculerEvaluation();
    }

    function ecouterEvenements() {
        const btnSuivantQuiz = document.getElementById("btn-suivant-quiz");
        if (btnSuivantQuiz) {
            btnSuivantQuiz.addEventListener("click", () => suivantQuiz());
        }

        const btnSuivantEval = document.getElementById("btn-suivant-eval");
        if (btnSuivantEval) {
            btnSuivantEval.addEventListener("click", () => suivantEval());
        }

        const btnPdf = document.getElementById("btn-telecharger-pdf");
        if (btnPdf) {
            btnPdf.addEventListener("click", () => genererPDFResultats());
        }
    }

    function calculerEvaluation() {
        let scoreTotal = 0;
        let detailsHTML = "";

        appData.evaluation.forEach(ex => {
            let ptsEx = 0;
            let errs = [];

            if (ex.type === "qcm_multiple") {
                ex.questions.forEach(q => {
                    const selVal = userAnswers[q.id];
                    if (selVal !== undefined && selVal !== "" && q.options[parseInt(selVal)].estCorrecte) {
                        ptsEx += 1;
                    } else {
                        errs.push(`• <em>${q.texte}</em> ➔ ${q.correction}`);
                    }
                });
            }
            else if (ex.type === "association") {
                ex.pairs.forEach(p => {
                    const val = userAnswers[p.id];
                    if (val === p.bonneReponse) {
                        ptsEx += p.pts;
                    } else {
                        errs.push(`• <em>${p.element}</em> ➔ Attendu : <strong>${p.bonneReponse}</strong>`);
                    }
                });
            }
            else if (ex.type === "champs_textes") {
                ex.questionsTextes.forEach(q => {
                    const val = (userAnswers[q.cle] || "").toLowerCase().trim();
                    const ok = q.motsCles.some(m => val.includes(m));
                    if (ok) {
                        ptsEx += q.pts;
                    } else {
                        errs.push(`• <em>${q.label}</em> ➔ Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            }
            else if (ex.type === "analyse_avancee") {
                ex.questionsLongues.forEach(q => {
                    const val = (userAnswers[q.cle] || "").toLowerCase().trim();
                    const ok = q.motsCles.some(m => val.includes(m));
                    if (ok) {
                        ptsEx += q.pts;
                    } else {
                        errs.push(`• <em>${q.label}</em> ➔ Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            }
            else if (ex.type === "tableur") {
                ex.lignes.forEach(l => {
                    l.champs.forEach(c => {
                        const val = (userAnswers[c.cle] || "").toLowerCase().trim();
                        const ok = c.motsCles.some(m => val.includes(m));
                        if (ok) {
                            ptsEx += c.pts;
                        } else {
                            errs.push(`• Tableur [${l.objet}] ➔ Attendu : <strong>${c.reponseType}</strong>`);
                        }
                    });
                });
            }
            else if (ex.type === "tableur_classification") {
                ex.lignes.forEach(l => {
                    const val = userAnswers[l.id];
                    if (val === l.bonneReponse) {
                        ptsEx += l.pts;
                    } else {
                        errs.push(`• <em>${l.element}</em> ➔ Attendu : <strong>${l.bonneReponse}</strong>`);
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

        const maintenant = new Date();
        const dateEl = document.getElementById("pdf-date");
        if (dateEl) {
            dateEl.textContent = "Réalisé le : " + maintenant.toLocaleDateString("fr-FR") + " à " + maintenant.toLocaleTimeString("fr-FR");
        }
        
        const noteEl = document.getElementById("note-finale");
        if (noteEl) {
            noteEl.textContent = Math.round(scoreTotal * 100) / 100;
        }

        const detailsEl = document.getElementById("eval-corrections-detail");
        if (detailsEl) {
            detailsEl.innerHTML = detailsHTML;
        }

        const resultsBox = document.getElementById("eval-results");
        if (resultsBox) {
            resultsBox.classList.remove("hidden");
            resultsBox.scrollIntoView({ behavior: "smooth" });
        }
    }

    // ==========================================
    // --- GESTION DE LA GÉNÉRATION PDF ---
    // ==========================================
    function genererPDFResultats() {
        const element = document.getElementById("pdf-report-area");
        if (!element) return;
        
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
