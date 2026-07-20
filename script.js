
// Attendre que le document HTML soit complètement chargé
document.addEventListener("DOMContentLoaded", () => {
    // Variable globale pour stocker les données du JSON
    let appData = null;

    // --- 1. CHARGEMENT DU FICHIER JSON ---
    fetch("questions.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur de chargement du fichier JSON");
            }
            return response.json();
        })
        .then(data => {
            appData = data;
            initialiserSite();
        })
        .catch(error => {
            console.error("Impossible de charger les données :", error);
            document.getElementById("cours-container").innerHTML = 
                `<p style="color: red;">⚠️ Impossible de charger les données du cours. Vérifiez le fichier questions.json.</p>`;
        });

    // --- 2. INITIALISATION ET INJECTION DU CONTENU ---
    function initialiserSite() {
        if (appData.titreGeneral) {
            document.getElementById("main-title").textContent = appData.titreGeneral;
        }

        afficherCours();
        afficherQuiz();
        afficherEvaluation();
        ecouterEvenements();
    }

    // Affichage synthétique de la partie Cours
    function afficherCours() {
        const container = document.getElementById("cours-container");
        container.innerHTML = "";

        appData.cours.sections.forEach(section => {
            const block = document.createElement("div");
            block.innerHTML = `
                <h3 style="font-size: 1.1rem; color: #0f172a; margin-bottom: 4px;">${section.sousTitre}</h3>
                <p style="color: #334155; font-size: 0.95rem;">${section.contenu}</p>
            `;
            container.appendChild(block);
        });
    }

    // Affichage du Quiz de vérification rapide (Partie 2)
    function afficherQuiz() {
        const container = document.getElementById("quiz-container");
        container.innerHTML = "";

        appData.quizComprehension.forEach((item, index) => {
            const qDiv = document.createElement("div");
            qDiv.className = "exercise-block";

            let optionsHTML = item.options.map((opt, optIdx) => `
                <label class="option-label">
                    <input type="radio" name="quiz_${item.id}" value="${optIdx}">
                    ${opt.texte}
                </label>
            `).join("");

            qDiv.innerHTML = `
                <p><strong>${item.question}</strong></p>
                <div style="margin-top: 8px;">${optionsHTML}</div>
            `;
            container.appendChild(qDiv);
        });
    }

    // Affichage des exercices de l'évaluation (Partie 3)
    function afficherEvaluation() {
        const container = document.getElementById("eval-container");
        container.innerHTML = "";

        appData.evaluation.forEach(ex => {
            const exDiv = document.createElement("div");
            exDiv.className = "exercise-block";

            let contenuSpecifique = "";

            // QCM
            if (ex.type === "qcm") {
                contenuSpecifique = ex.options.map((opt, i) => `
                    <label class="option-label">
                        <input type="radio" name="${ex.id}" value="${i}">
                        ${opt.texte}
                    </label>
                `).join("");
            } 
            // Champs de textes courts
            else if (ex.type === "champs_textes") {
                contenuSpecifique = ex.questionsTextes.map(q => `
                    <div style="margin-top: 10px;">
                        <label><strong>${q.label}</strong></label>
                        <input type="text" name="${q.cle}" class="input-text" placeholder="Ta réponse ici...">
                    </div>
                `).join("");
            } 
            // Rédaction courte
            else if (ex.type === "redaction") {
                contenuSpecifique = `
                    <textarea name="${ex.id}_text" class="textarea" placeholder="Rédige ton argumentation ici..."></textarea>
                `;
            }

            exDiv.innerHTML = `
                <div class="exercise-header">
                    <strong>${ex.titre}</strong>
                    <span class="tag bg-purple">${ex.niveau} • ${ex.points} pts</span>
                </div>
                <p style="font-size: 0.95rem; margin-bottom: 8px;">${ex.enonce}</p>
                ${contenuSpecifique}
            `;
            container.appendChild(exDiv);
        });
    }

    // --- 3. GESTION DES ÉVÉNEMENTS & CORRECTIONS ---
    function ecouterEvenements() {
        // Validation du Quiz rapide
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
                        explications.push(`• <strong>${item.id.toUpperCase()} :</strong> ${item.explication}`);
                    }
                } else {
                    explications.push(`• <strong>${item.id.toUpperCase()} :</strong> Non répondue.`);
                }
            });

            const feedback = document.getElementById("quiz-feedback");
            feedback.classList.remove("hidden");
            
            if (score === total) {
                feedback.innerHTML = `<strong>🎉 Bravo ! ${score}/${total}</strong>. Tu maîtrises parfaitement les concepts du cours !`;
            } else {
                feedback.innerHTML = `<strong>Résultat : ${score}/${total}</strong>.<br>${explications.join("<br>")}`;
            }
        });

        // Soumission de l'Évaluation Progressive
        document.getElementById("btn-soumettre-eval").addEventListener("click", () => {
            calculerEvaluation();
        });
    }

    // Calcul de la note sur 20 et génération de la correction
    function calculerEvaluation() {
        let noteTotale = 0;
        let detailsCorrectionHTML = "";

        appData.evaluation.forEach(ex => {
            let ptsExercice = 0;
            let commEx = "";

            if (ex.type === "qcm") {
                const selected = document.querySelector(`input[name="${ex.id}"]:checked`);
                if (selected) {
                    const idx = parseInt(selected.value);
                    const opt = ex.options[idx];
                    ptsExercice = opt.pts;
                }
                commEx = `<p>Note : <strong>${ptsExercice}/${ex.points}</strong>. ${ex.correction}</p>`;
            } 
            else if (ex.type === "champs_textes") {
                let reponsesCorrection = [];
                ex.questionsTextes.forEach(q => {
                    const input = document.querySelector(`input[name="${q.cle}"]`);
                    const val = input ? input.value.toLowerCase().trim() : "";
                    
                    // Vérification par présence de mots-clés
                    const contientMotCle = q.motsCles.some(mot => val.includes(mot));
                    if (contientMotCle) {
                        ptsExercice += q.pts;
                    }
                    reponsesCorrection.push(`• <em>${q.label}</em> $\rightarrow$ Reponse attendue : <strong>${q.reponseType}</strong>`);
                });
                commEx = `<p>Note : <strong>${ptsExercice}/${ex.points}</strong></p>` + reponsesCorrection.join("<br>");
            } 
            else if (ex.type === "redaction") {
                const txt = document.querySelector(`textarea[name="${ex.id}_text"]`).value.toLowerCase();
                let motsTrouves = 0;
                
                ex.motsClesObligatoires.forEach(mot => {
                    if (txt.includes(mot)) motsTrouves++;
                });

                // Attribution progressive des points selon le nombre de mots-clés présents
                if (motsTrouves >= 3) {
                    ptsExercice = ex.points;
                } else if (motsTrouves >= 1) {
                    ptsExercice = Math.round(ex.points / 2);
                }

                commEx = `<p>Note attribuée (analyse automatique) : <strong>${ptsExercice}/${ex.points}</strong></p>
                          <p>${ex.correctionModele}</p>`;
            }

            noteTotale += ptsExercice;

            detailsCorrectionHTML += `
                <div class="correction-item">
                    <h4>${ex.titre}</h4>
                    ${commEx}
                </div>
            `;
        });

        // Affichage final des résultats
        document.getElementById("note-finale").textContent = noteTotale;
        document.getElementById("eval-corrections-detail").innerHTML = detailsCorrectionHTML;
        document.getElementById("eval-results").classList.remove("hidden");

        // Défilement doux vers la section de résultats
        document.getElementById("eval-results").scrollIntoView({ behavior: "smooth" });
    }
});
