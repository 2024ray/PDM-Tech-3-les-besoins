// ========== VÉRIFICATION DE LA SÉANCE DÉJÀ FAITE ==========
function chargerDonnees() {
    // Vérification si l'élève a déjà complété la séance
    const sessionFaite = localStorage.getItem('module2_termine');
    if (sessionFaite === 'true') {
        afficherMessageVerrouillage();
        return;
    }

    // Chargement normal si non fait
    fetch('questions.json?t=' + Date.now(), { cache: 'no-store' })
        .then(res => res.json())
        .then(dataJson => {
            data = dataJson;
            initialiserCours();
            preparerQuiz();
            preparerEval();
        })
        .catch(e => console.error("Erreur de chargement du JSON:", e));
}

function afficherMessageVerrouillage() {
    $('main.container').innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
            <h2>🔒 Séance déjà réalisée</h2>
            <p>Vous avez déjà soumis vos réponses pour ce module. Il n'est pas possible de refaire les questions.</p>
        </div>
    `;
}
