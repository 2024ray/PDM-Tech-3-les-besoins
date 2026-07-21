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

    // Stockage global des réponses fournies par l'élève
    let userEvalAnswers = {};

    const QUIZ_TIMER_DURATION = 60;   // 60 secondes pour le quiz
    const EVAL_TIMER_DURATION = 180;  // 180 secondes pour les étapes de l'évaluation

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
        let tempsRestant = QUIZ_TIMER_DURATION;
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
        let tempsRestant = EVAL_TIMER_DURATION;
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
                sauvegarderReponsesQuestionCourante();
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

    function sauvegarderReponsesQuestionCourante() {
        const item = evalItems[currentEvalIndex];
        if (!item) return;

        if (item.type === "qcm_multiple") {
            const sel = document.querySelector(`input[name="${item.data.id}"]:checked`);
            if (sel) userEvalAnswers[item.data.id] = sel.value;
        } else if (item.type === "association") {
            const sel = document.querySelector(`select[name="${item.data.id}"]`);
            if (sel) userEvalAnswers[item.data.id] = sel.value;
        } else if (item.type === "champs_textes" || item.type === "analyse_avancee") {
            const input = document.querySelector(`input[name="${item.data.cle}"]`);
            if (input) userEvalAnswers[item.data.cle] = input.value;
        } else if (item.type === "tableur") {
            item.data.champs.forEach(c => {
                const input = document.querySelector(`input[name="${c.cle}"]`);
                if (input) userEvalAnswers[c.cle] = input.value;
            });
        } else if (item.type === "tableur_classification") {
            const sel = document.querySelector(`select[name="${item.data.id}"]`);
            if (sel) userEvalAnswers[item.data.id] = sel.value;
        }
    }

    function suivantEval() {
        sauvegarderReponsesQuestionCourante();
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
                    const val = userEvalAnswers[q.id];
                    if (val !== undefined && q.options[parseInt(val)].estCorrecte) {
                        ptsEx += 1;
                    } else {
                        errs.push(`• <em>${q.texte}</em> ➔ ${q.correction}`);
                    }
                });
            }
            else if (ex.type === "association") {
                ex.pairs.forEach(p => {
                    const val = userEvalAnswers[p.id];
                    if (val && val === p.bonneReponse) {
                        ptsEx += p.pts;
                    } else {
                        errs.push(`• <em>${p.element}</em> ➔ Attendu : <strong>${p.bonneReponse}</strong>`);
                    }
                });
            }
            else if (ex.type === "champs_textes") {
                ex.questionsTextes.forEach(q => {
                    const val = (userEvalAnswers[q.cle] || "").toLowerCase().trim();
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
                    const val = (userEvalAnswers[q.cle] || "").toLowerCase().trim();
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
                        const val = (userEvalAnswers[c.cle] || "").toLowerCase().trim();
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
                    const val = userEvalAnswers[l.id];
                    if (val && val === l.bonneReponse) {
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
        document.getElementById("pdf-date").textContent = "Réalisé le : " + maintenant.toLocaleDateString("fr-FR") + " à " + maintenant.toLocaleTimeString("fr-FR");
        document.getElementById("note-finale").textContent = Math.round(scoreTotal * 100) / 100;
        document.getElementById("eval-corrections-detail").innerHTML = detailsHTML;
        
        const resultsBox = document.getElementById("eval-results");
        resultsBox.classList.remove("hidden");
        resultsBox.scrollIntoView({ behavior: "smooth" });
    }

    // ==========================================
    // --- GESTION DE LA GÉNÉRATION PDF (CORRIGÉ) ---
    // ==========================================
    function genererPDFResultats() {
        const element = document.getElementById("pdf-report-area");
        const containerResults = document.getElementById("eval-results");

        // Force l'affichage global du composant
        containerResults.classList.remove("hidden");

        const opt = {
            margin:       [10, 10, 10, 10],
            filename:     'Resultats_Evaluation_Technologie_3eme.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2,
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Pause de 100ms pour garantir la fin du rendu du DOM avant capture
        setTimeout(() => {
            if (window.html2pdf) {
                html2pdf().set(opt).from(element).save().catch(err => {
                    console.error("Erreur PDF:", err);
                    window.print();
                });
            } else {
                window.print();
            }
        }, 100);
    }
});
