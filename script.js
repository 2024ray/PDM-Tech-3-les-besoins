document.addEventListener("DOMContentLoaded", () => {
    let appData = null;

    // Charger les données du fichier JSON
    fetch("questions.json")
        .then(response => {
            if (!response.ok) throw new Error("Erreur de chargement du JSON");
            return response.json();
        })
        .then(data => {
            appData = data;
            initialiserSite();
        })
        .catch(error => {
            console.error("Erreur :", error);
            document.getElementById("cours-container").innerHTML = 
                `<p style="color:red;">⚠️ Erreur au chargement du fichier questions.json</p>`;
        });

    function initialiserSite() {
        if (appData.titreGeneral) {
            document.getElementById("main-title").textContent = appData.titreGeneral;
        }

        afficherCours();
        afficherQuiz();
        afficherEvaluation();
        ecouterEvenements();
    }

    function afficherCours() {
        const container = document.getElementById("cours-container");
        container.innerHTML = "";
        appData.cours.sections.forEach(sec => {
            const div = document.createElement("div");
            div.innerHTML = `<h3 style="color:#0f172a; margin-bottom:4px;">${sec.sousTitre}</h3><p style="color:#334155;">${sec.contenu}</p>`;
            container.appendChild(div);
        });
    }

    function afficherQuiz() {
        const container = document.getElementById("quiz-container");
        container.innerHTML = "";

        appData.quizComprehension.forEach(item => {
            const qDiv = document.createElement("div");
            qDiv.className = "exercise-block";

            const options = item.options.map((opt, idx) => `
                <label class="option-label">
                    <input type="radio" name="quiz_${item.id}" value="${idx}">
                    ${opt.texte}
                </label>
            `).join("");

            qDiv.innerHTML = `<p><strong>${item.question}</strong></p><div>${options}</div>`;
            container.appendChild(qDiv);
        });
    }

    function afficherEvaluation() {
        const container = document.getElementById("eval-container");
        container.innerHTML = "";

        appData.evaluation.forEach(ex => {
            const exDiv = document.createElement("div");
            exDiv.className = "exercise-block";

            let htmlSpecifique = "";

            if (ex.type === "qcm_multiple") {
                htmlSpecifique = ex.questions.map(q => `
                    <div style="margin-top:10px;">
                        <p><strong>${q.texte}</strong></p>
                        ${q.options.map((opt, i) => `
                            <label class="option-label">
                                <input type="radio" name="${q.id}" value="${i}">
                                ${opt.texte}
                            </label>
                        `).join("")}
                    </div>
                `).join("");
            } 
            else if (ex.type === "association") {
                htmlSpecifique = ex.pairs.map(p => `
                    <div style="margin-top:10px;">
                        <label><strong>${p.element} :</strong></label>
                        <select name="${p.id}" class="select-input">
                            <option value="">-- Choisis une option --</option>
                            ${p.choix.map(c => `<option value="${c}">${c}</option>`).join("")}
                        </select>
                    </div>
                `).join("");
            } 
            else if (ex.type === "champs_textes") {
                htmlSpecifique = ex.questionsTextes.map(q => `
                    <div style="margin-top:10px;">
                        <label><strong>${q.label}</strong></label>
                        <input type="text" name="${q.cle}" class="input-text" placeholder="Rédige ta réponse...">
                    </div>
                `).join("");
            } 
            else if (ex.type === "analyse_avancee") {
                htmlSpecifique = ex.questionsLongues.map(q => `
                    <div style="margin-top:10px;">
                        <label><strong>${q.label}</strong></label>
                        <input type="text" name="${q.cle}" class="input-text" placeholder="Rédige ton explication...">
                    </div>
                `).join("");
            }

            exDiv.innerHTML = `
                <div class="exercise-header">
                    <strong>${ex.titre}</strong>
                    <span class="tag bg-purple">${ex.niveau} • ${ex.points} pts</span>
                </div>
                ${htmlSpecifique}
            `;
            container.appendChild(exDiv);
        });
    }

    function ecouterEvenements() {
        // Validation du Quiz
        document.getElementById("btn-valider-quiz").addEventListener("click", () => {
            let score = 0;
            let total = appData.quizComprehension.length;
            let explications = [];

            appData.quizComprehension.forEach(item => {
                const selected = document.querySelector(`input[name="quiz_${item.id}"]:checked`);
                if (selected) {
                    const idx = parseInt(selected.value);
                    if (item.options[idx].estCorrecte) {
                        score++;
                    } else {
                        explications.push(`• <strong>Q${item.id.replace('q','')} :</strong> ${item.explication}`);
                    }
                } else {
                    explications.push(`• <strong>Q${item.id.replace('q','')} :</strong> Non répondue.`);
                }
            });

            const feedback = document.getElementById("quiz-feedback");
            feedback.classList.remove("hidden");
            feedback.innerHTML = `<strong>Score Quiz : ${score}/${total}</strong><br>${explications.join("<br>")}`;
        });

        // Validation de l'Évaluation
        document.getElementById("btn-soumettre-eval").addEventListener("click", () => {
            calculerEvaluation();
        });
    }

    function calculerEvaluation() {
        let noteTotale = 0;
        let detailsHTML = "";

        appData.evaluation.forEach(ex => {
            let ptsEx = 0;
            let corrections = [];

            if (ex.type === "qcm_multiple") {
                ex.questions.forEach(q => {
                    const sel = document.querySelector(`input[name="${q.id}"]:checked`);
                    if (sel && q.options[parseInt(sel.value)].estCorrecte) {
                        ptsEx += 1;
                    } else {
                        corrections.push(`• <em>${q.texte}</em> $\rightarrow$ ${q.correction}`);
                    }
                });
            } 
            else if (ex.type === "association") {
                ex.pairs.forEach(p => {
                    const sel = document.querySelector(`select[name="${p.id}"]`);
                    if (sel && sel.value === p.bonneReponse) {
                        ptsEx += p.pts;
                    } else {
                        corrections.push(`• <em>${p.element}</em> $\rightarrow$ Attendu : <strong>${p.bonneReponse}</strong>`);
                    }
                });
            } 
            else if (ex.type === "champs_textes") {
                ex.questionsTextes.forEach(q => {
                    const input = document.querySelector(`input[name="${q.cle}"]`);
                    const val = input ? input.value.toLowerCase().trim() : "";
                    const OK = q.motsCles.some(m => val.includes(m));
                    if (OK) {
                        ptsEx += q.pts;
                    } else {
                        corrections.push(`• <em>${q.label}</em> $\rightarrow$ Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            } 
            else if (ex.type === "analyse_avancee") {
                ex.questionsLongues.forEach(q => {
                    const input = document.querySelector(`input[name="${q.cle}"]`);
                    const val = input ? input.value.toLowerCase().trim() : "";
                    const OK = q.motsCles.some(m => val.includes(m));
                    if (OK) {
                        ptsEx += q.pts;
                    } else {
                        corrections.push(`• <em>${q.label}</em> $\rightarrow$ Attendu : <strong>${q.reponseType}</strong>`);
                    }
                });
            }

            noteTotale += ptsEx;

            detailsHTML += `
                <div class="correction-item">
                    <h4>${ex.titre} - Note : ${ptsEx}/${ex.points}</h4>
                    ${corrections.length > 0 ? corrections.join("<br>") : "<p style='color:green;'>Parfait ! Toutes les réponses de cet exercice sont correctes.</p>"}
                </div>
            `;
        });

        document.getElementById("note-finale").textContent = noteTotale;
        document.getElementById("eval-corrections-detail").innerHTML = detailsHTML;
        document.getElementById("eval-results").classList.remove("hidden");
        document.getElementById("eval-results").scrollIntoView({ behavior: "smooth" });
    }
});
