// Données de l'activité intégrées directement (Évite tout blocage CORS/JSON)
const data = {
    "titreGeneral": "Analyse du Besoin",
    "deroulement": {
        "titre": "📌 Déroulement de l'activité",
        "etapes": [
            "<strong>1. Cours synthétique :</strong> Lisez attentivement la synthèse sur la notion de besoin, le diagramme Bête à cornes, la valeur d'usage/d'estime et l'évolution des objets.",
            "<strong>2. Quiz de compréhension (15 questions) :</strong> Un QCM chrono de 20 minutes pour tester vos connaissances fondamentales.",
            "<strong>3. Évaluation pratique (15 exercices - 40 pts) :</strong> Des exercices variés (tableaux, trous, associations) avec un temps limité à 1 min 30 par exercice.",
            "<strong>4. Bilan & Bilan PDF :</strong> Consultez vos erreurs/réussites et téléchargez votre bilan au format PDF."
        ]
    },
    "cours": {
        "introduction": "L'analyse du besoin est la première étape de tout projet technique. Elle permet d'identifier précisément ce que l'utilisateur attend d'un produit.",
        "sections": [
            {"titre": "1. La notion de Besoin", "contenu": "Un <strong>besoin</strong> est le sentiment d'une privation ou d'une insuffisance. En technologie, on cherche à identifier le besoin auquel un produit doit répondre. <em>Ex : Besoin de se déplacer → voiture.</em>"},
            {"titre": "2. Le diagramme Bête à cornes", "contenu": "La <strong>Bête à cornes</strong> répond à 3 questions : <br>• <em>À qui le produit rend-il service ?</em><br>• <em>Sur quoi agit-il ?</em><br>• <em>Dans quel but ?</em><br>Il se compose de 3 ovales reliés au produit central."},
            {"titre": "3. Usage vs Estime", "contenu": "• <strong>Valeur d'usage</strong> : aptitude du produit à satisfaire le besoin (utilité pratique).<br>• <strong>Valeur d'estime</strong> : caractéristiques subjectives (design, marque, couleur, prestige)."},
            {"titre": "4. Évolution des besoins", "contenu": "Les besoins évoluent avec la société, la technologie et l'environnement. Les objets techniques s'adaptent : nouveaux matériaux, nouvelles fonctions, nouvelles formes."}
        ]
    },
    "quizComprehension": [
        {"id": "q1", "question": "La Bête à cornes sert à identifier le besoin auquel répond un produit.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux", "correct": false}, {"texte": "Partiellement vrai", "correct": false}, {"texte": "Impossible à dire", "correct": false}]},
        {"id": "q2", "question": "La valeur d'estime correspond à l'utilité pratique du produit.", "options": [{"texte": "Vrai", "correct": false}, {"texte": "Faux, c'est la valeur d'usage", "correct": true}, {"texte": "Vrai parfois", "correct": false}, {"texte": "Faux, c'est le prix", "correct": false}]},
        {"id": "q3", "question": "Un besoin technique peut évoluer au fil du temps.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux", "correct": false}, {"texte": "Seulement pour les objets anciens", "correct": false}, {"texte": "Uniquement en informatique", "correct": false}]},
        {"id": "q4", "question": "La Bête à cornes comporte exactement 3 ovales.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux, il y en a 4", "correct": false}, {"texte": "Faux, il y en a 2", "correct": false}, {"texte": "Faux, il n'y a pas d'ovales", "correct": false}]},
        {"id": "q5", "question": "La valeur d'usage dépend des goûts personnels de l'utilisateur.", "options": [{"texte": "Faux, c'est la valeur d'estime", "correct": true}, {"texte": "Vrai", "correct": false}, {"texte": "Vrai seulement pour les vêtements", "correct": false}, {"texte": "Impossible à déterminer", "correct": false}]},
        {"id": "q6", "question": "Un besoin est le sentiment d'une privation ou d'une insuffisance.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux", "correct": false}, {"texte": "Vrai uniquement en économie", "correct": false}, {"texte": "Faux, c'est un désir", "correct": false}]},
        {"id": "q7", "question": "La première question de la Bête à cornes est : 'Sur quoi agit-il ?'", "options": [{"texte": "Faux, c'est 'À qui rend-il service ?'", "correct": true}, {"texte": "Vrai", "correct": false}, {"texte": "Faux, c'est 'Dans quel but ?'", "correct": false}, {"texte": "Faux, c'est 'Combien coûte-t-il ?'", "correct": false}]},
        {"id": "q8", "question": "La couleur d'un produit est une valeur d'usage.", "options": [{"texte": "Faux, c'est une valeur d'estime", "correct": true}, {"texte": "Vrai", "correct": false}, {"texte": "Vrai pour les voitures", "correct": false}, {"texte": "Les deux à la fois", "correct": false}]},
        {"id": "q9", "question": "L'analyse du besoin se fait après la fabrication du produit.", "options": [{"texte": "Faux, elle se fait avant la conception", "correct": true}, {"texte": "Vrai", "correct": false}, {"texte": "Vrai pour les prototypes", "correct": false}, {"texte": "Impossible à dire", "correct": false}]},
        {"id": "q10", "question": "La Bête à cornes est un outil graphique.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux, c'est un tableau", "correct": false}, {"texte": "Faux, c'est un texte", "correct": false}, {"texte": "Faux, c'est une formule", "correct": false}]},
        {"id": "q11", "question": "La marque d'un sac à main représente une valeur d'usage.", "options": [{"texte": "Faux, c'est une valeur d'estime", "correct": true}, {"texte": "Vrai", "correct": false}, {"texte": "Vrai pour les sacs professionnels", "correct": false}, {"texte": "Les deux à la fois", "correct": false}]},
        {"id": "q12", "question": "Le diagramme Bête à cornes répond à la question 'Dans quel but ?'.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux", "correct": false}, {"texte": "Seulement pour les véhicules", "correct": false}, {"texte": "Faux, c'est le diagramme pieuvre", "correct": false}]},
        {"id": "q13", "question": "Un besoin est toujours de nature matérielle.", "options": [{"texte": "Faux, il peut être immatériel", "correct": true}, {"texte": "Vrai", "correct": false}, {"texte": "Vrai en technologie", "correct": false}, {"texte": "Impossible à dire", "correct": false}]},
        {"id": "q14", "question": "L'autonomie d'une batterie est une valeur d'usage.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux, c'est de l'estime", "correct": false}, {"texte": "Faux, c'est un prix", "correct": false}, {"texte": "Impossible à classer", "correct": false}]},
        {"id": "q15", "question": "Les besoins humains restent identiques à travers les siècles.", "options": [{"texte": "Faux, ils évoluent avec la société", "correct": true}, {"texte": "Vrai", "correct": false}, {"texte": "Vrai pour les besoins primaires", "correct": false}, {"texte": "Impossible à dire", "correct": false}]}
    ],
    "evaluation": [
        {
            "id": "ex1", "type": "tableau-menu", "niveau": "Facile",
            "titre": "Ex1 - Identifier le besoin (3 pts)",
            "enonce": "Choisis le besoin auquel répond chaque produit.",
            "questions": [
                {"id": "ex1q1", "enonce": "Calculatrice en maths.", "options": [{"texte": "Calculer rapidement", "correct": true}, {"texte": "Se déplacer", "correct": false}, {"texte": "Communiquer", "correct": false}, {"texte": "Se divertir", "correct": false}, {"texte": "Se nourrir", "correct": false}], "pts": 0.6},
                {"id": "ex1q2", "enonce": "Réfrigérateur.", "options": [{"texte": "Conserver aliments", "correct": true}, {"texte": "S'éclairer", "correct": false}, {"texte": "Se chauffer", "correct": false}, {"texte": "Se divertir", "correct": false}, {"texte": "Communiquer", "correct": false}], "pts": 0.6},
                {"id": "ex1q3", "enonce": "Baskets amortissantes.", "options": [{"texte": "Protéger articulations", "correct": true}, {"texte": "Se parer", "correct": false}, {"texte": "Se nourrir", "correct": false}, {"texte": "Se loger", "correct": false}, {"texte": "Communiquer", "correct": false}], "pts": 0.6},
                {"id": "ex1q4", "enonce": "Bancs dans un parc.", "options": [{"texte": "Se reposer", "correct": true}, {"texte": "Se déplacer", "correct": false}, {"texte": "Se chauffer", "correct": false}, {"texte": "Se nourrir", "correct": false}, {"texte": "S'éclairer", "correct": false}], "pts": 0.6},
                {"id": "ex1q5", "enonce": "Casque de vélo.", "options": [{"texte": "Se protéger", "correct": true}, {"texte": "Se déplacer", "correct": false}, {"texte": "Communiquer", "correct": false}, {"texte": "Se divertir", "correct": false}, {"texte": "Se loger", "correct": false}], "pts": 0.6}
            ]
        },
        {
            "id": "ex2", "type": "choix-multiple", "niveau": "Facile",
            "titre": "Ex2 - Caractéristiques d'un besoin (3 pts)",
            "enonce": "Coche TOUTES les affirmations correctes sur le besoin.",
            "options": [
                {"texte": "Le besoin est une privation ressentie", "correct": true, "pts": 1},
                {"texte": "Le besoin peut évoluer", "correct": true, "pts": 1},
                {"texte": "Le besoin est toujours matériel", "correct": false, "pts": 0},
                {"texte": "L'analyse du besoin précède la conception", "correct": true, "pts": 1},
                {"texte": "Un besoin ne change jamais", "correct": false, "pts": 0}
            ]
        },
        {
            "id": "ex3", "type": "valeur-numerique", "niveau": "Moyen",
            "titre": "Ex3 - Bête à cornes (2 pts)",
            "enonce": "Combien d'ovales comporte la Bête à cornes ? Saisis ta réponse numérique.",
            "bonnesReponses": ["3"],
            "pts": 2
        },
        {
            "id": "ex4", "type": "reponse-saisie", "niveau": "Moyen",
            "titre": "Ex4 - Définition du besoin (2 pts)",
            "enonce": "Complète : Un besoin est le sentiment d'une _______ ou d'une insuffisance.",
            "bonnesReponses": ["privation"],
            "ignorerCasse": true,
            "ignorerAccents": false,
            "pts": 2
        },
        {
            "id": "ex5", "type": "association", "niveau": "Moyen",
            "titre": "Ex5 - Associer concepts et définitions (3 pts)",
            "enonce": "Associe chaque concept à sa définition correcte.",
            "associations": [
                {"terme": "Bête à cornes", "definition": "Diagramme à 3 ovales", "pts": 1},
                {"terme": "Valeur d'usage", "definition": "Utilité pratique", "pts": 1},
                {"terme": "Valeur d'estime", "definition": "Caractéristiques subjectives", "pts": 1}
            ]
        },
        {
            "id": "ex6", "type": "texte-trous-libre", "niveau": "Moyen",
            "titre": "Ex6 - Texte à trous libre (2 pts)",
            "enonce": "Complète le texte en saisissant les mots manquants.",
            "texte": "La Bête à cornes répond à trois questions : À {{}} le produit rend-il service ? Sur {{}} agit-il ?",
            "trous": [
                {"bonnesReponses": ["qui"], "pts": 1},
                {"bonnesReponses": ["quoi"], "pts": 1}
            ]
        },
        {
            "id": "ex7", "type": "texte-trous-liste-unique", "niveau": "Moyen",
            "titre": "Ex7 - Texte à trous liste unique (2 pts)",
            "enonce": "Complète le texte en choisissant dans la liste commune.",
            "texte": "Un produit répond à un {{}} identifié grâce à la Bête à {{}}.",
            "listeCommune": ["besoin", "cornes", "usage", "estime", "produit"],
            "trous": [
                {"bonneReponse": "besoin", "pts": 1},
                {"bonneReponse": "cornes", "pts": 1}
            ]
        },
        {
            "id": "ex8", "type": "texte-trous-liste-variable", "niveau": "Avancé",
            "titre": "Ex8 - Texte à trous liste variable (2 pts)",
            "enonce": "Complète le texte en choisissant dans la liste spécifique à chaque trou.",
            "texte": "La valeur d'{{}} correspond à l'utilité, la valeur d'{{}} correspond au design.",
            "trous": [
                {"liste": ["usage", "estime", "besoin", "produit"], "bonneReponse": "usage", "pts": 1},
                {"liste": ["usage", "estime", "besoin", "produit"], "bonneReponse": "estime", "pts": 1}
            ]
        },
        {
            "id": "ex9", "type": "choix-unique", "niveau": "Facile",
            "titre": "Ex9 - QCM besoin (3 pts)",
            "enonce": "Qu'est-ce qu'un besoin technique ?",
            "options": [
                {"texte": "Une privation ou insuffisance ressentie", "correct": true, "pts": 3},
                {"texte": "Un objet obligatoire", "correct": false, "pts": 0},
                {"texte": "Une marque de produit", "correct": false, "pts": 0},
                {"texte": "Un prix élevé", "correct": false, "pts": 0}
            ]
        },
        {
            "id": "ex10", "type": "tableau-menu", "niveau": "Facile",
            "titre": "Ex10 - Bête à cornes : À qui ? (3 pts)",
            "enonce": "À qui rend service chaque produit ?",
            "questions": [
                {"id": "ex10q1", "enonce": "Tableau interactif.", "options": [{"texte": "Enseignant/élèves", "correct": true}, {"texte": "Principal", "correct": false}, {"texte": "Parents", "correct": false}, {"texte": "Gardien", "correct": false}, {"texte": "Fournisseurs", "correct": false}], "pts": 0.6},
                {"id": "ex10q2", "enonce": "Tondeuse automatique.", "options": [{"texte": "Jardinier", "correct": true}, {"texte": "Boulanger", "correct": false}, {"texte": "Médecin", "correct": false}, {"texte": "Chauffeur", "correct": false}, {"texte": "Pilote", "correct": false}], "pts": 0.6},
                {"id": "ex10q3", "enonce": "Fauteuil roulant.", "options": [{"texte": "Personne à mobilité réduite", "correct": true}, {"texte": "Sportif", "correct": false}, {"texte": "Cuisinier", "correct": false}, {"texte": "Astronaute", "correct": false}, {"texte": "Plongeur", "correct": false}], "pts": 0.6},
                {"id": "ex10q4", "enonce": "Distributeur billets.", "options": [{"texte": "Clients banque", "correct": true}, {"texte": "Agriculteurs", "correct": false}, {"texte": "Pompiers", "correct": false}, {"texte": "Profs musique", "correct": false}, {"texte": "Architectes", "correct": false}], "pts": 0.6},
                {"id": "ex10q5", "enonce": "App traduction.", "options": [{"texte": "Voyageurs/étudiants", "correct": true}, {"texte": "Pêcheurs", "correct": false}, {"texte": "Maçons", "correct": false}, {"texte": "Boulangers", "correct": false}, {"texte": "Coiffeurs", "correct": false}], "pts": 0.6}
            ]
        },
        {
            "id": "ex11", "type": "tableau-menu", "niveau": "Moyen",
            "titre": "Ex11 - Bête à cornes : Sur quoi ? (3 pts)",
            "enonce": "Sur quoi agit chaque produit ?",
            "questions": [
                {"id": "ex11q1", "enonce": "Voiture.", "options": [{"texte": "Déplacement personnes", "correct": true}, {"texte": "Décoration", "correct": false}, {"texte": "Météo", "correct": false}, {"texte": "Routes", "correct": false}, {"texte": "Passagers", "correct": false}], "pts": 0.6},
                {"id": "ex11q2", "enonce": "Aspirateur.", "options": [{"texte": "Propreté sols", "correct": true}, {"texte": "Éclairage", "correct": false}, {"texte": "Température", "correct": false}, {"texte": "Murs", "correct": false}, {"texte": "Bruit", "correct": false}], "pts": 0.6},
                {"id": "ex11q3", "enonce": "Parapluie.", "options": [{"texte": "Protection pluie", "correct": true}, {"texte": "Température", "correct": false}, {"texte": "Vent", "correct": false}, {"texte": "Marche", "correct": false}, {"texte": "Vêtements", "correct": false}], "pts": 0.6},
                {"id": "ex11q4", "enonce": "Lampe bureau.", "options": [{"texte": "Éclairage plan travail", "correct": true}, {"texte": "Chauffage", "correct": false}, {"texte": "Décoration", "correct": false}, {"texte": "Lecture", "correct": false}, {"texte": "Son", "correct": false}], "pts": 0.6},
                {"id": "ex11q5", "enonce": "Casque audio.", "options": [{"texte": "Écoute personnelle", "correct": true}, {"texte": "Téléphone", "correct": false}, {"texte": "Protection auditive", "correct": false}, {"texte": "Décoration", "correct": false}, {"texte": "Concentration", "correct": false}], "pts": 0.6}
            ]
        },
        {
            "id": "ex12", "type": "tableau-menu", "niveau": "Moyen",
            "titre": "Ex12 - Usage ou Estime ? (3 pts)",
            "enonce": "Usage ou Estime pour chaque caractéristique ?",
            "questions": [
                {"id": "ex12q1", "enonce": "Freinage vélo.", "options": [{"texte": "Usage", "correct": true}, {"texte": "Estime", "correct": false}, {"texte": "Ni l'un", "correct": false}, {"texte": "Les deux", "correct": false}, {"texte": "Impossible", "correct": false}], "pts": 0.6},
                {"id": "ex12q2", "enonce": "Couleur rouge voiture.", "options": [{"texte": "Estime", "correct": true}, {"texte": "Usage", "correct": false}, {"texte": "Ni l'un", "correct": false}, {"texte": "Les deux", "correct": false}, {"texte": "Impossible", "correct": false}], "pts": 0.6},
                {"id": "ex12q3", "enonce": "Marque luxe sac.", "options": [{"texte": "Estime", "correct": true}, {"texte": "Usage", "correct": false}, {"texte": "Ni l'un", "correct": false}, {"texte": "Les deux", "correct": false}, {"texte": "Impossible", "correct": false}], "pts": 0.6},
                {"id": "ex12q4", "enonce": "Autonomie batterie.", "options": [{"texte": "Usage", "correct": true}, {"texte": "Estime", "correct": false}, {"texte": "Ni l'un", "correct": false}, {"texte": "Les deux", "correct": false}, {"texte": "Impossible", "correct": false}], "pts": 0.6},
                {"id": "ex12q5", "enonce": "Design montre.", "options": [{"texte": "Estime", "correct": true}, {"texte": "Usage", "correct": false}, {"texte": "Ni l'un", "correct": false}, {"texte": "Les deux", "correct": false}, {"texte": "Impossible", "correct": false}], "pts": 0.6}
            ]
        },
        {
            "id": "ex13", "type": "choix-multiple", "niveau": "Avancé",
            "titre": "Ex13 - Évolution des objets (3 pts)",
            "enonce": "Coche TOUTES les évolutions correctes.",
            "options": [
                {"texte": "Téléphone : mobilité et connectivité", "correct": true, "pts": 1},
                {"texte": "Éclairage : efficacité énergétique", "correct": true, "pts": 1},
                {"texte": "Transport : retour au cheval", "correct": false, "pts": 0},
                {"texte": "Musique : dématérialisation", "correct": true, "pts": 1},
                {"texte": "Photo : retour argentique obligatoire", "correct": false, "pts": 0}
            ]
        },
        {
            "id": "ex14", "type": "reponse-saisie", "niveau": "Avancé",
            "titre": "Ex14 - Outil d'analyse (1 pt)",
            "enonce": "Quel outil graphique permet d'identifier le besoin ? (2 mots)",
            "bonnesReponses": ["bête à cornes", "bete a cornes"],
            "ignorerCasse": true,
            "ignorerAccents": true,
            "pts": 1
        },
        {
            "id": "ex15", "type": "tableau-menu", "niveau": "Avancé",
            "titre": "Ex15 - Analyse vidéoprojecteur (5 pts)",
            "enonce": "Analyse complète d'un vidéoprojecteur interactif.",
            "questions": [
                {"id": "ex15q1", "enonce": "Besoin principal ?", "options": [{"texte": "Améliorer pédagogie", "correct": true}, {"texte": "Remplacer profs", "correct": false}, {"texte": "Divertir", "correct": false}, {"texte": "Décorer", "correct": false}, {"texte": "Réduire cours", "correct": false}], "pts": 1},
                {"id": "ex15q2", "enonce": "À qui rend-il service ?", "options": [{"texte": "Enseignants/élèves", "correct": true}, {"texte": "Entretien", "correct": false}, {"texte": "Parents", "correct": false}, {"texte": "Fournisseurs", "correct": false}, {"texte": "Mairie", "correct": false}], "pts": 1},
                {"id": "ex15q3", "enonce": "Sur quoi agit-il ?", "options": [{"texte": "Présentation cours", "correct": true}, {"texte": "Murs", "correct": false}, {"texte": "Chauffage", "correct": false}, {"texte": "Éclairage", "correct": false}, {"texte": "Fenêtres", "correct": false}], "pts": 1},
                {"id": "ex15q4", "enonce": "Valeur d'usage ?", "options": [{"texte": "Projection interactive", "correct": true}, {"texte": "Couleur blanche", "correct": false}, {"texte": "Marque", "correct": false}, {"texte": "Design", "correct": false}, {"texte": "Prix", "correct": false}], "pts": 1},
                {"id": "ex15q5", "enonce": "Évolution future ?", "options": [{"texte": "Fonctions connectées", "correct": true}, {"texte": "Retour tableau noir", "correct": false}, {"texte": "Suppression projection", "correct": false}, {"texte": "Taille uniquement", "correct": false}, {"texte": "Disparition interactivité", "correct": false}], "pts": 1}
            ]
        }
    ]
};

// Variables d'état
let quizIndex = 0;
let quizScore = 0;
let quizTimer = null;
let quizTempsRestant = 20 * 60;
let quizReponses = [];

let evalIndex = 0;
let evalScoreTotal = 0;
let evalTimer = null;
let evalTempsRestant = 90;
let evalReponses = [];

const $ = (s) => document.querySelector(s);

document.addEventListener('DOMContentLoaded', () => {
    initialiserCours();
    attacherEvenements();
});

// ========== 1. COURS SYNTHÉTIQUE ==========
function initialiserCours() {
    let html = '';
    
    if (data.deroulement) {
        html += `
        <div class="deroulement-card">
            <h2>${data.deroulement.titre}</h2>
            <div class="steps-grid">`;
        data.deroulement.etapes.forEach(etape => {
            html += `<div class="step-item">${etape}</div>`;
        });
        html += `</div></div>`;
    }

    html += `<h2 class="section-title">📖 Cours synthétique</h2>`;
    html += `<div class="intro-box">🎯 <strong>Introduction :</strong> ${data.cours.introduction}</div>`;
    
    html += `<div class="cours-grid">`;
    data.cours.sections.forEach(s => {
        html += `
        <div class="cours-card">
            <h3>${s.titre}</h3>
            <p>${s.contenu}</p>
        </div>`;
    });
    html += `</div>`;

    $('#contenu-cours').innerHTML = html;
}

// ========== EVENEMENTS ==========
function attacherEvenements() {
    $('#btn-commencer-quiz').addEventListener('click', lancerQuiz);
    $('#btn-suivant-quiz').addEventListener('click', questionQuizSuivante);
    $('#btn-suivant-eval').addEventListener('click', validerExerciceEval);
    $('#btn-telecharger-pdf').addEventListener('click', genererPDF);
    $('#btn-recommencer').addEventListener('click', () => location.reload());
}

// ========== 2. QUIZ DE COMPRÉHENSION ==========
function lancerQuiz() {
    $('#section-cours').classList.add('hidden');
    $('#section-quiz').classList.remove('hidden');
    demarrerChronoQuiz();
    afficherQuestionQuiz();
}

function demarrerChronoQuiz() {
    updateTimerDisplay('#quiz-timer', quizTempsRestant);
    quizTimer = setInterval(() => {
        quizTempsRestant--;
        updateTimerDisplay('#quiz-timer', quizTempsRestant);
        if (quizTempsRestant <= 0) {
            clearInterval(quizTimer);
            terminerQuiz();
        }
    }, 1000);
}

function afficherQuestionQuiz() {
    const q = data.quizComprehension[quizIndex];
    $('#quiz-progress').textContent = `Question ${quizIndex + 1} / ${data.quizComprehension.length}`;
    $('#quiz-progress-bar').style.width = `${((quizIndex + 1) / data.quizComprehension.length) * 100}%`;
    $('#quiz-question').innerHTML = `<strong>Question ${quizIndex + 1} :</strong> ${q.question}`;
    
    let htmlOptions = '';
    q.options.forEach((opt, idx) => {
        htmlOptions += `<button class="option-btn" data-idx="${idx}">${opt.texte}</button>`;
    });
    $('#quiz-options').innerHTML = htmlOptions;
    $('#btn-suivant-quiz').classList.add('hidden');

    document.querySelectorAll('#quiz-options .option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => selectionnerOptionQuiz(e, q));
    });
}

function selectionnerOptionQuiz(e, question) {
    document.querySelectorAll('#quiz-options .option-btn').forEach(b => b.classList.remove('selected'));
    e.target.classList.add('selected');
    
    const selectedIdx = parseInt(e.target.dataset.idx);
    const isCorrect = question.options[selectedIdx].correct;
    
    quizReponses[quizIndex] = {
        question: question.question,
        choix: question.options[selectedIdx].texte,
        correct: isCorrect,
        pts: isCorrect ? 1 : 0
    };

    $('#btn-suivant-quiz').classList.remove('hidden');
}

function questionQuizSuivante() {
    quizIndex++;
    if (quizIndex < data.quizComprehension.length) {
        afficherQuestionQuiz();
    } else {
        terminerQuiz();
    }
}

function terminerQuiz() {
    clearInterval(quizTimer);
    quizScore = quizReponses.reduce((acc, r) => acc + (r ? r.pts : 0), 0);
    lancerEvaluation();
}

// ========== 3. ÉVALUATION PRATIQUE ==========
function lancerEvaluation() {
    $('#section-quiz').classList.add('hidden');
    $('#section-eval').classList.remove('hidden');
    afficherExerciceEval();
}

function afficherExerciceEval() {
    const ex = data.evaluation[evalIndex];
    evalTempsRestant = 90;
    demarrerChronoEval();

    $('#eval-progress').textContent = `Exercice ${evalIndex + 1} / ${data.evaluation.length}`;
    $('#eval-progress-bar').style.width = `${((evalIndex + 1) / data.evaluation.length) * 100}%`;
    $('#eval-question').innerHTML = `<strong>${ex.titre}</strong> (${ex.niveau})<br>${ex.enonce}`;

    let html = '';
    
    if (ex.type === 'tableau-menu') {
        html += `<table class="eval-table"><thead><tr><th>Élément</th><th>Choix</th></tr></thead><tbody>`;
        ex.questions.forEach(q => {
            html += `<tr><td>${q.enonce}</td><td><select id="select-${q.id}">`;
            html += `<option value="">-- Choisir --</option>`;
            q.options.forEach(o => html += `<option value="${o.texte}">${o.texte}</option>`);
            html += `</select></td></tr>`;
        });
        html += `</tbody></table>`;
    } else if (ex.type === 'choix-multiple') {
        ex.options.forEach((opt, idx) => {
            html += `<label class="checkbox-label"><input type="checkbox" name="ex-check" value="${idx}"> ${opt.texte}</label><br>`;
        });
    } else if (ex.type === 'valeur-numerique' || ex.type === 'reponse-saisie') {
        html += `<input type="text" id="eval-input-text" class="input-text" placeholder="Saisissez votre réponse ici...">`;
    } else if (ex.type === 'association') {
        ex.associations.forEach((assoc, idx) => {
            html += `<div class="assoc-row"><span>${assoc.terme} ➡️ </span><select id="assoc-${idx}">`;
            html += `<option value="">-- Sélectionner la définition --</option>`;
            ex.associations.forEach(a => html += `<option value="${a.definition}">${a.definition}</option>`);
            html += `</select></div>`;
        });
    } else if (ex.type === 'texte-trous-libre') {
        let texteFormate = ex.texte.replace(/\{\{\}\}/g, '<input type="text" class="input-hole">');
        html += `<div class="holes-container">${texteFormate}</div>`;
    } else if (ex.type === 'texte-trous-liste-unique') {
        let optionsHtml = `<option value="">-- Choix --</option>` + ex.listeCommune.map(l => `<option value="${l}">${l}</option>`).join('');
        let texteFormate = ex.texte.replace(/\{\{\}\}/g, `<select class="select-hole">${optionsHtml}</select>`);
        html += `<div class="holes-container">${texteFormate}</div>`;
    } else if (ex.type === 'texte-trous-liste-variable') {
        let count = 0;
        let texteFormate = ex.texte.replace(/\{\{\}\}/g, () => {
            let optionsHtml = `<option value="">-- Choix --</option>` + ex.trous[count].liste.map(l => `<option value="${l}">${l}</option>`).join('');
            count++;
            return `<select class="select-hole-var">${optionsHtml}</select>`;
        });
        html += `<div class="holes-container">${texteFormate}</div>`;
    } else if (ex.type === 'choix-unique') {
        ex.options.forEach((opt, idx) => {
            html += `<label class="radio-label"><input type="radio" name="ex-radio" value="${idx}"> ${opt.texte}</label><br>`;
        });
    }

    $('#eval-content').innerHTML = html;
}

function demarrerChronoEval() {
    clearInterval(evalTimer);
    updateTimerDisplay('#eval-timer', evalTempsRestant);
    evalTimer = setInterval(() => {
        evalTempsRestant--;
        updateTimerDisplay('#eval-timer', evalTempsRestant);
        if (evalTempsRestant <= 0) {
            clearInterval(evalTimer);
            validerExerciceEval();
        }
    }, 1000);
}

function validerExerciceEval() {
    clearInterval(evalTimer);
    const ex = data.evaluation[evalIndex];
    let ptsGagnes = 0;

    if (ex.type === 'tableau-menu') {
        ex.questions.forEach(q => {
            const val = $(`#select-${q.id}`).value;
            const bonne = q.options.find(o => o.correct);
            if (val === bonne.texte) ptsGagnes += q.pts;
        });
    } else if (ex.type === 'choix-multiple') {
        const checked = Array.from(document.querySelectorAll('input[name="ex-check"]:checked')).map(c => parseInt(c.value));
        ex.options.forEach((opt, idx) => {
            if (opt.correct && checked.includes(idx)) ptsGagnes += opt.pts;
        });
    } else if (ex.type === 'valeur-numerique' || ex.type === 'reponse-saisie') {
        const val = $('#eval-input-text').value.trim();
        let correct = ex.bonnesReponses.some(r => {
            let v = val, ref = r;
            if (ex.ignorerCasse) { v = v.toLowerCase(); ref = ref.toLowerCase(); }
            if (ex.ignorerAccents) { v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); ref = ref.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
            return v === ref;
        });
        if (correct) ptsGagnes = ex.pts;
    } else if (ex.type === 'association') {
        ex.associations.forEach((assoc, idx) => {
            if ($(`#assoc-${idx}`).value === assoc.definition) ptsGagnes += assoc.pts;
        });
    } else if (ex.type === 'texte-trous-libre') {
        const inputs = document.querySelectorAll('.input-hole');
        inputs.forEach((inp, idx) => {
            if (ex.trous[idx].bonnesReponses.includes(inp.value.trim().toLowerCase())) {
                ptsGagnes += ex.trous[idx].pts;
            }
        });
    } else if (ex.type === 'texte-trous-liste-unique') {
        const selects = document.querySelectorAll('.select-hole');
        selects.forEach((sel, idx) => {
            if (sel.value === ex.trous[idx].bonneReponse) ptsGagnes += ex.trous[idx].pts;
        });
    } else if (ex.type === 'texte-trous-liste-variable') {
        const selects = document.querySelectorAll('.select-hole-var');
        selects.forEach((sel, idx) => {
            if (sel.value === ex.trous[idx].bonneReponse) ptsGagnes += ex.trous[idx].pts;
        });
    } else if (ex.type === 'choix-unique') {
        const selected = document.querySelector('input[name="ex-radio"]:checked');
        if (selected) {
            const idx = parseInt(selected.value);
            if (ex.options[idx].correct) ptsGagnes = ex.options[idx].pts;
        }
    }

    evalReponses.push({ titre: ex.titre, pts: ptsGagnes, totalEx: ObtenirTotalPtsEx(ex) });
    evalScoreTotal += ptsGagnes;

    evalIndex++;
    if (evalIndex < data.evaluation.length) {
        afficherExerciceEval();
    } else {
        afficherBilanFinal();
    }
}

function ObtenirTotalPtsEx(ex) {
    if (ex.pts) return ex.pts;
    if (ex.questions) return ex.questions.reduce((a, q) => a + q.pts, 0);
    if (ex.options) return ex.options.reduce((a, o) => a + (o.pts || 0), 0);
    if (ex.associations) return ex.associations.reduce((a, ass) => a + ass.pts, 0);
    if (ex.trous) return ex.trous.reduce((a, t) => a + t.pts, 0);
    return 0;
}

// ========== 4. BILAN FINAL & PDF ==========
function afficherBilanFinal() {
    $('#section-eval').classList.add('hidden');
    $('#pdf-report-area').classList.remove('hidden');

    const totalGlobal = quizScore + evalScoreTotal;
    let mention = 'À travailler 📝';
    if (totalGlobal >= 48) mention = 'ExcellentWork ! 🌟';
    else if (totalGlobal >= 40) mention = 'Très bien ! 👏';
    else if (totalGlobal >= 28) mention = 'Satisfaisant 👍';

    let html = `
    <div class="score-summary">
        <h3>Résultats de l'Élève - Enseignant : Mr DURAND</h3>
        <p class="score-main">Score Total : <strong>${totalGlobal.toFixed(1)} / 55</strong></p>
        <p>• Quiz de compréhension : ${quizScore} / 15</p>
        <p>• Évaluation pratique : ${evalScoreTotal.toFixed(1)} / 40</p>
        <p class="mention">Mention : <strong>${mention}</strong></p>
    </div>
    <hr>
    <h4>Détail des exercices pratiques :</h4>
    <ul class="results-list">`;

    evalReponses.forEach(r => {
        html += `<li><strong>${r.titre}</strong> : ${r.pts.toFixed(1)} / ${r.totalEx} pts</li>`;
    });
    html += `</ul>`;

    $('#resultats-detail').innerHTML = html;
}

function genererPDF() {
    const element = $('#pdf-report-area');
    const opt = {
        margin:       10,
        filename:     'Bilan_Analyse_Du_Besoin_Mr_DURAND.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function updateTimerDisplay(selector, tempsSec) {
    const minutes = String(Math.floor(tempsSec / 60)).padStart(2, '0');
    const secondes = String(tempsSec % 60).padStart(2, '0');
    $(selector).textContent = `⏱️ ${minutes}:${secondes}`;
}
