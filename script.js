document.addEventListener("DOMContentLoaded", () => {
    let appData = null;

    // Variables d'état pour la navigation question par question
    let quizQuestions = [];
    let currentQuizIndex = 0;
    let quizAnswers = {}; // Pour sauvegarder les choix du quiz

    let evalQuestions = [];
    let currentEvalIndex = 0;
    let evalAnswers = {}; // Pour sauvegarder les réponses de l'évaluation

    // Variables pour le Minuteur
    let timerInterval = null;
    let tempsRestant = 20 * 60; // 20 minutes en secondes
    let minuteurLance = false;
    let evalSoumise = false;

    // Fonction de mélange aléatoire (Fisher-Yates)
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
            document.getElementById("main-title").textContent = appData.titreGeneral;
        }

        afficherCours();
        
        // Préparation du quiz
        quizQuestions = melanger(appData.quizComprehension);
        afficherQuestionQuiz();

        // Préparation de l'évaluation
        preparerEvaluation();
        afficherQuestionEval();

        // Démarrage du minuteur dès le chargement de la page
        lancerMinuteur();

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

    /* -------------------------------------------------------------------------- */
    /*                              GESTION DU MINUTEUR                           */
    /* -------------------------------------------------------------------------- */

    function lancerMinuteur() {
        if (minuteurLance) return;
        minuteurLance = true;

        mettreAJourAffichageMinuteur();

        timerInterval = setInterval(() => {
            tempsRestant--;
            mettreAJourAffichageMinuteur();

            if (tempsRestant <= 0) {
                clearInterval(timerInterval);
                finDuTempsAutoSoumission();
            }
        }, 1000);
    }

    function mettreAJourAffichageMinuteur() {
        const elTimer = document.getElementById("timer-display");
        if (!elTimer) return;

        const minutes = Math.floor(tempsRestant / 60);
        const secondes = tempsRestant % 60;

        const strMin = String(minutes).padStart(2, '0');
        const strSec = String(secondes).padStart(2, '0');

        elTimer.textContent = `⏱️ ${strMin}:${strSec}`;

        // Alerte visuelle quand il reste moins de 2 minutes (120 sec)
        if (tempsRestant <= 120) {
            elTimer.classList.add("timer-danger");
        }
    }

    function finDuTempsAutoSoumission() {
        if (evalSoumise) return;
        
        alert("⏱️ Le temps de 20 minutes est écoulé ! Votre évaluation va être soumise automatiquement.");
        calculerEvaluation();
    }

    /* -------------------------------------------------------------------------- */
    /*                               PARTIE 2 : QUIZ                              */
    /* -------------------------------------------------------------------------- */

    function afficherQuestionQuiz() {
        const container = document.getElementById("quiz-container");
        const item = quizQuestions[currentQuizIndex];
        const total = quizQuestions.length;

        document.getElementById("quiz-progress").textContent = `Question ${currentQuizIndex + 1} / ${total}`;

        const options = item.options.map((opt, idx) => {
            const checked = quizAnswers[`quiz_${item.id}`] === idx ? "checked" : "";
            return `
                <label class="option-label">
                    <input type="radio" name="quiz_${item.id}" value="${idx}" ${checked}>
                    ${opt.texte}
                </label>
            `;
        }).join("");

        container.innerHTML = `
            <div class="exercise-block">
                <p><strong>${currentQuizIndex + 1}. ${item.question}</strong></p>
                <div>${options}</div>
            </div>
        `;

        document.getElementById("btn-quiz-prev").style.display = currentQuizIndex === 0 ? "none" : "inline-block";
        if (currentQuizIndex === total - 1) {
            document.getElementById("btn-quiz-next").style.display = "none";
            document.getElementById("btn-valider-quiz").style.display = "inline-block";
        } else {
            document.getElementById("btn-quiz-next").style.display = "inline-block";
            document.getElementById("btn-valider-quiz").style.display = "none";
        }

        container.querySelectorAll(`input[name="quiz_${item.id}"]`).forEach(input => {
            input.addEventListener("change", (e) => {
                quizAnswers[`quiz_${item.id}`] = parseInt(e.target.value);
            });
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                            PARTIE 3 : ÉVALUATION                           */
    /* -------------------------------------------------------------------------- */

    function preparerEvaluation() {
        evalQuestions = [];
        appData.evaluation.forEach(ex => {
            if (ex.type === "qcm_multiple") {
                melanger(ex.questions).forEach(q => {
                    evalQuestions.push({ ...q, exType: ex.type, exTitre: ex.titre, ptsMax: 1 });
                });
            } else if (ex.type === "association") {
                melanger(ex.pairs).forEach(p => {
                    evalQuestions.push({ ...p, exType: ex.type, exTitre: ex.titre, ptsMax: p.pts });
                });
            } else if (ex.type === "champs_textes") {
                melanger(ex.questionsTextes).forEach(q => {
                    evalQuestions.push({ ...q, exType: ex.type, exTitre: ex.titre, ptsMax: q.pts });
                });
            } else if (ex.type === "analyse_avancee") {
                melanger(ex.questionsLongues).forEach(q => {
                    evalQuestions.push({ ...q, exType: ex.type, exTitre: ex.titre, ptsMax: q.pts });
                });
            } else if (ex.type === "tableur") {
                evalQuestions.push({ ...ex, exType: ex.type, exTitre: ex.titre, ptsMax: ex.points });
            } else if (ex.type === "tableur_classification") {
                evalQuestions.push({ ...ex, exType: ex.type, exTitre: ex.titre, ptsMax: ex.points });
            }
        });
    }

    function afficherQuestionEval() {
        const container = document.getElementById("eval-container");
        const item = evalQuestions[currentEvalIndex];
        const total = evalQuestions.length;

        document.getElementById("eval-progress").textContent = `Étape ${currentEvalIndex + 1} / ${total}`;

        let contentHTML = `<div class="exercise-header"><strong>${item.exTitre}</strong></div>`;

        if (item.exType === "qcm_multiple") {
            contentHTML += `
                <div class="exercise-block">
                    <p><strong>${item.texte}</strong></p>
                    ${item.options.map((opt, i) => {
                        const checked = evalAnswers[item.id] === i ? "checked" : "";
                        return `
                            <label class="option-label">
                                <input type="radio" name="${item.id}" value="${i}" ${checked}>
                                ${opt.texte}
                            </label>
                        `;
                    }).join("")}
                </div>
            `;
        } else if (item.exType === "association") {
            const currentVal = evalAnswers[item.id] || "";
            contentHTML += `
                <div class="exercise-block">
                    <label><strong>${item.element} :</strong></label>
                    <select name="${item.id}" class="select-input">
                        <option value="">-- Choisis une option --</option>
                        ${item.choix.map(c => `<option value="${c}" ${currentVal === c ? "selected" : ""}>${c}</option>`).join("")}
                    </select>
                </div>
            `;
        } else if (item.exType === "champs_textes" || item.exType === "analyse_avancee") {
            const currentVal = evalAnswers[item.cle] || "";
            contentHTML += `
                <div class="exercise-block">
                    <label><strong>${item.label}</strong></label>
                    <input type="text" name="${item.cle}" class="input-text" value="${currentVal}" placeholder="Rédige ta réponse...">
                </div>
            `;
        } else if (item.exType === "tableur") {
            const lignesMelangees = melanger(item.lignes);
            const headersHTML = item.colonnes.map(col => `<th>${col}</th>`).join("");
            const rowsHTML = lignesMelangees.map(l => `
                <tr>
                    <td><strong>${l.objet}</strong></td>
                    ${l.champs.map(c => {
                        const val = evalAnswers[c.cle] || "";
                        return `
                            <td>
                                <input type="text" name="${c.cle}" class="tableur-cell-input" value="${val}" placeholder="Remplir...">
                            </td>
                        `;
                    }).join("")}
                </tr>
            `).join("");

            contentHTML += `
                <div class="exercise-block">
                    <p style="margin-bottom:8px;">${item.consigne}</p>
                    <div class="tableur-wrapper">
                        <table class="tableur-custom">
                            <thead><tr>${headersHTML}</tr></thead>
                            <tbody>${rowsHTML}</tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (item.exType === "tableur_classification") {
            const lignesMelangees = melanger(item.lignes);
            const headersHTML = item.colonnes.map(col => `<th>${col}</th>`).join("");
            const rowsHTML = lignesMelangees.map(l => {
                const val = evalAnswers[l.id] || "";
                return `
                    <tr>
                        <td>${l.element}</td>
                        <td>
                            <select name="${l.id}" class="tableur-cell-input">
                                <option value="">-- Sélectionner --</option>
                                <option value="Usage" ${val === "Usage" ? "selected" : ""}>Fonction d'Usage</option>
                                <option value="Estime" ${val === "Estime" ? "selected" : ""}>Fonction d'Estime</option>
                                <option value="Aucun" ${val === "Aucun" ? "selected" : ""}>Aucun</option>
                                <option value="Les deux" ${val === "Les deux" ? "selected" : ""}>Les deux</option>
                            </select>
                        </td>
                    </tr>
                `;
            }).join("");

            contentHTML += `
                <div class="exercise-block">
                    <p style="margin-bottom:8px;">${item.consigne}</p>
                    <div class="tableur-wrapper">
                        <table class="tableur-custom">
                            <thead><tr>${headersHTML}</tr></thead>
                            <tbody>${rowsHTML}</tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        container.innerHTML = contentHTML;

        document.getElementById("btn-eval-prev").style.display = currentEvalIndex === 0 ? "none" : "inline-block";
        if (currentEvalIndex === total - 1) {
            document.getElementById("btn-eval-next").style.display = "none";
            document.getElementById("btn-soumettre-eval").style.display = "inline-block";
        } else {
            document.getElementById("btn-eval-next").style.display = "inline-block";
            document.getElementById("btn-soumettre-eval").style.display = "none";
        }

        attacherEcouteursSauvegarde(container);
    }

    function attacherEcouteursSauvegarde(container) {
        container.querySelectorAll("input, select").forEach(input => {
            input.addEventListener("change", (e) => {
                if (e.target.type === "radio") {
                    evalAnswers[e.target.name] = parseInt(e.target.value);
                } else {
                    evalAnswers[e.target.name] = e.target.value;
                }
            });
            if (input.type === "text") {
                input.addEventListener("input", (e) => {
                    evalAnswers[e.target.name] = e.target.value;
                });
            }
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                            GESTION DES ÉVÉNEMENTS                          */
    /* -------------------------------------------------------------------------- */

    function ecouterEvenements() {
        // Navigation Quiz
        document.getElementById("btn-quiz-next").addEventListener("click", () => {
            if (currentQuizIndex < quizQuestions.length - 1) {
                currentQuizIndex++;
                afficherQuestionQuiz();
            }
        });

        document.getElementById("btn-quiz-prev").addEventListener("click", () => {
            if (currentQuizIndex > 0) {
                currentQuizIndex--;
                afficherQuestionQuiz();
            }
        });

        document.getElementById("btn-valider-quiz").addEventListener("click", () => {
            let score = 0;
            let total = quizQuestions.length;
            let feedback = [];

            quizQuestions.forEach(item => {
                const answerIdx = quizAnswers[`quiz_${item.id}`];
                if (answerIdx !== undefined && item.options[answerIdx].estCorrecte) {
                    score++;
                } else {
                    feedback.push(`• <strong>Question "${item.question.substring(0, 35)}..." :</strong> ${item.explication}`);
                }
            });

            const box = document.getElementById("quiz-feedback");
            box.classList.remove("hidden");
            box.innerHTML = `<strong>Score : ${score}/${total}</strong><br>${feedback.join("<br>")}`;
        });

        // Navigation Évaluation
        document.getElementById("btn-eval-next").addEventListener("click", () => {
            if (currentEvalIndex < evalQuestions.length - 1) {
                currentEvalIndex++;
                afficherQuestionEval();
            }
        });

        document.getElementById("btn-eval-prev").addEventListener("click", () => {
            if (currentEvalIndex > 0) {
                currentEvalIndex--;
                afficherQuestionEval();
            }
        });

        document.getElementById("btn-soumettre-eval").addEventListener("click", () => {
            calculerEvaluation();
        });
    }

    function calculerEvaluation() {
        if (evalSoumise) return;
        evalSoumise = true;

        // Arrêter le minuteur
        if (timerInterval) clearInterval(timerInterval);

        let scoreTotal = 0;
        let detailsHTML = "";

        appData.evaluation.forEach(ex => {
            let ptsEx = 0;
            let errs = [];

            if (ex.type === "qcm_multiple") {
                ex.questions.forEach(q => {
                    const ans = evalAnswers[q.id];
                    if (ans !== undefined && q.options[ans].estCorrecte) {
                        ptsEx += 1;
                    } else {
                        errs.push(`• <em>${q.texte}</em> → ${q.correction}`);
                    }
                });
            } else if (ex.type === "association") {
                ex.pairs.forEach(p => {
                    const ans = evalAnswers[p.id];
                    if (ans === p.bonneReponse) {
                        ptsEx += p.pts;
                    } else {
                        errs.push(`• <em>${p.element}</em> → Attendu : <strong>${p.bonneReponse}</strong>`);
                    }
                });
            } else if (ex.type === "champs_textes") {
                ex.questionsTextes.forEach(q => {
                    const val = (evalAnswers[q.cle] || "").toLowerCase().trim();
                    const ok = q.motsCles.some(m => val.includes(m));
                    if (ok) {
                        ptsEx += q.pts;
                    } else {
                        errs.push(`• <em>${q.label}</em> → Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            } else if (ex.type === "analyse_avancee") {
                ex.questionsLongues.forEach(q => {
                    const val = (evalAnswers[q.cle] || "").toLowerCase().trim();
                    const ok = q.motsCles.some(m => val.includes(m));
                    if (ok) {
                        ptsEx += q.pts;
                    } else {
                        errs.push(`• <em>${q.label}</em> → Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            } else if (ex.type === "tableur") {
                ex.lignes.forEach(l => {
                    l.champs.forEach(c => {
                        const val = (evalAnswers[c.cle] || "").toLowerCase().trim();
                        const ok = c.motsCles.some(m => val.includes(m));
                        if (ok) {
                            ptsEx += c.pts;
                        } else {
                            errs.push(`• Tableur [${l.objet}] → Attendu : <strong>${c.reponseType}</strong>`);
                        }
                    });
                });
            } else if (ex.type === "tableur_classification") {
                ex.lignes.forEach(l => {
                    const ans = evalAnswers[l.id];
                    if (ans === l.bonneReponse) {
                        ptsEx += l.pts;
                    } else {
                        errs.push(`• <em>${l.element}</em> → Attendu : <strong>${l.bonneReponse}</strong>`);
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

        // Désactiver les boutons de navigation de l'évaluation
        document.getElementById("btn-eval-prev").disabled = true;
        document.getElementById("btn-eval-next").disabled = true;
        document.getElementById("btn-soumettre-eval").disabled = true;
    }
});
