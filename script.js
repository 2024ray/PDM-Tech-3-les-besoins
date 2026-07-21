document.addEventListener("DOMContentLoaded", () => {
    let appData = null;

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
        afficherQuiz();
        afficherEvaluation();
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

            let contentHTML = "";

            if (ex.type === "qcm_multiple") {
                contentHTML = ex.questions.map(q => `
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
                contentHTML = ex.pairs.map(p => `
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
                contentHTML = ex.questionsTextes.map(q => `
                    <div style="margin-top:10px;">
                        <label><strong>${q.label}</strong></label>
                        <input type="text" name="${q.cle}" class="input-text" placeholder="Rédige ta réponse...">
                    </div>
                `).join("");
            }
            else if (ex.type === "analyse_avancee") {
                contentHTML = ex.questionsLongues.map(q => `
                    <div style="margin-top:10px;">
                        <label><strong>${q.label}</strong></label>
                        <input type="text" name="${q.cle}" class="input-text" placeholder="Rédige ton explication...">
                    </div>
                `).join("");
            }
            else if (ex.type === "tableur") {
                const headersHTML = ex.colonnes.map(col => `<th>${col}</th>`).join("");
                const rowsHTML = ex.lignes.map(l => `
                    <tr>
                        <td><strong>${l.objet}</strong></td>
                        ${l.champs.map(c => `
                            <td>
                                <input type="text" name="${c.cle}" class="tableur-cell-input" placeholder="Remplir...">
                            </td>
                        `).join("")}
                    </tr>
                `).join("");

                contentHTML = `
                    <p style="margin-bottom:8px;">${ex.consigne}</p>
                    <div class="tableur-wrapper">
                        <table class="tableur-custom">
                            <thead><tr>${headersHTML}</tr></thead>
                            <tbody>${rowsHTML}</tbody>
                        </table>
                    </div>
                `;
            }
            else if (ex.type === "tableur_classification") {
                const headersHTML = ex.colonnes.map(col => `<th>${col}</th>`).join("");
                const rowsHTML = ex.lignes.map(l => `
                    <tr>
                        <td>${l.element}</td>
                        <td>
                            <select name="${l.id}" class="tableur-cell-input">
                                <option value="">-- Sélectionner --</option>
                                <option value="Usage">Fonction d'Usage</option>
                                <option value="Estime">Fonction d'Estime</option>
                            </select>
                        </td>
                    </tr>
                `).join("");

                contentHTML = `
                    <p style="margin-bottom:8px;">${ex.consigne}</p>
                    <div class="tableur-wrapper">
                        <table class="tableur-custom">
                            <thead><tr>${headersHTML}</tr></thead>
                            <tbody>${rowsHTML}</tbody>
                        </table>
                    </div>
                `;
            }

            exDiv.innerHTML = `
                <div class="exercise-header">
                    <strong>${ex.titre}</strong>
                    <span class="tag bg-purple">${ex.niveau} • ${ex.points} pts</span>
                </div>
                ${contentHTML}
            `;
            container.appendChild(exDiv);
        });
    }

    function ecouterEvenements() {
        document.getElementById("btn-valider-quiz").addEventListener("click", () => {
            let score = 0;
            let total = appData.quizComprehension.length;
            let feedback = [];

            appData.quizComprehension.forEach(item => {
                const selected = document.querySelector(`input[name="quiz_${item.id}"]:checked`);
                if (selected && item.options[parseInt(selected.value)].estCorrecte) {
                    score++;
                } else {
                    feedback.push(`• <strong>Q${item.id.replace('q','')} :</strong> ${item.explication}`);
                }
            });

            const box = document.getElementById("quiz-feedback");
            box.classList.remove("hidden");
            box.innerHTML = `<strong>Score : ${score}/${total}</strong><br>${feedback.join("<br>")}`;
        });

        document.getElementById("btn-soumettre-eval").addEventListener("click", () => {
            calculerEvaluation();
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
