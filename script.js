// ==========================================
// DONNÉES DU COURS, QUIZ ET EXERCICES
// ==========================================
const data = {
    "titreGeneral": "L'Analyse du Besoin - Module 2",
    "cours": {
        "introduction": "L'analyse du besoin est le Module 2 de notre parcours de formation. Elle permet d'identifier, exprimer et valider l'attente client avant toute conception.",
        "sections": [
            {"titre": "1. Identification & Formulation du Besoin", "contenu": "Un <strong>besoin</strong> correspond à une privation ou une attente de l'utilisateur. L'objectif est de saisir précisément le besoin client pour définir ce que le produit doit réaliser."},
            {"titre": "2. Outils de Modélisation", "contenu": "• <strong>Bête à cornes</strong> : Répond aux questions <em>À qui ? Sur quoi ? Dans quel but ?</em><br>• <strong>Diagramme Pieuvre</strong> : Permet d'identifier les fonctions principales (FP) et les fonctions de contrainte (FC) reliées à l'environnement du produit."},
            {"titre": "3. Cahier des Charges Fonctionnel (CDCF)", "contenu": "Le <strong>CDCF</strong> est le document formel qui regroupe l'expression du besoin, les fonctions à assurer, ainsi que les critères de caractérisation et de validation."},
            {"titre": "4. Déroulement de la Séance (Théorie & Pratique)", "contenu": "La formation s'articule en 4 temps : 1. Introduction & Objectifs ➡️ 2. Partie Cours ➡️ 3. Atelier pratique en sous-groupes ➡️ 4. Restitution orale et correction interactive."}
        ]
    },
    "quizComprehension": [
        {"id": "q1", "question": "La Bête à cornes sert à identifier le besoin auquel répond un produit.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux", "correct": false}, {"texte": "Partiellement vrai", "correct": false}, {"texte": "Impossible à dire", "correct": false}]},
        {"id": "q2", "question": "Quel outil permet d'identifier les fonctions principales (FP) et de contrainte (FC) ?", "options": [{"texte": "Le Diagramme Pieuvre", "correct": true}, {"texte": "La Bête à cornes", "correct": false}, {"texte": "Le Grafcet", "correct": false}, {"texte": "L'organigramme", "correct": false}]},
        {"id": "q3", "question": "Que signifie le sigle CDCF ?", "options": [{"texte": "Cahier des Charges Fonctionnel", "correct": true}, {"texte": "Contrat de Conception Finale", "correct": false}, {"texte": "Calcul de Charge des Fonctions", "correct": false}, {"texte": "Cahier de Contrôle Fonctionnel", "correct": false}]},
        {"id": "q4", "question": "La Bête à cornes comporte exactement 3 ovales.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux, il y en a 4", "correct": false}, {"texte": "Faux, il y en a 2", "correct": false}, {"texte": "Faux, il n'y a pas d'ovales", "correct": false}]},
        {"id": "q5", "question": "Quelle est la dernière étape du déroulement de la séance du Module 2 ?", "options": [{"texte": "Restitution et correction interactive", "correct": true}, {"texte": "Partie cours", "correct": false}, {"texte": "Introduction", "correct": false}, {"texte": "Atelier pratique", "correct": false}]},
        {"id": "q6", "question": "Un besoin est le sentiment d'une privation ou d'une insuffisance.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux", "correct": false}, {"texte": "Vrai uniquement en économie", "correct": false}, {"texte": "Faux, c'est un désir", "correct": false}]},
        {"id": "q7", "question": "Le Diagramme Pieuvre relie le produit à ses milieux environnants.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux", "correct": false}, {"texte": "Uniquement pour l'informatique", "correct": false}, {"texte": "Uniquement pour le BTP", "correct": false}]},
        {"id": "q8", "question": "Dans un atelier pratique, la rédaction porte notamment sur les critères de validation.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux", "correct": false}, {"texte": "C'est facultatif", "correct": false}, {"texte": "Uniquement sur le prix", "correct": false}]},
        {"id": "q9", "question": "L'analyse du besoin se fait après la fabrication du produit.", "options": [{"texte": "Faux, elle se fait avant la conception", "correct": true}, {"texte": "Vrai", "correct": false}, {"texte": "Vrai pour les prototypes", "correct": false}, {"texte": "Impossible à dire", "correct": false}]},
        {"id": "q10", "question": "Le cours théorique nourrit directement la partie exercices et cas pratiques.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux, ils sont indépendants", "correct": false}, {"texte": "Uniquement en contrôle continu", "correct": false}, {"texte": "Jamais", "correct": false}]},
        {"id": "q11", "question": "La valeur d'estime correspond aux caractéristiques subjectives (design, prestige).", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux, c'est la valeur d'usage", "correct": false}, {"texte": "C'est le coût de fabrication", "correct": false}, {"texte": "C'est la garantie", "correct": false}]},
        {"id": "q12", "question": "Le diagramme Bête à cornes répond à la question 'Dans quel but ?'.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux", "correct": false}, {"texte": "Seulement pour les véhicules", "correct": false}, {"texte": "Faux, c'est le diagramme pieuvre", "correct": false}]},
        {"id": "q13", "question": "Quels sont les deux grands axes d'organisation du chapitre ?", "options": [{"texte": "Partie Cours Théorique et Partie Exercices Pratiques", "correct": true}, {"texte": "Examen final et Projet individuel", "correct": false}, {"texte": "Analyse du coût et Devis", "correct": false}, {"texte": "Soutenance orale et Rapport écrit", "correct": false}]},
        {"id": "q14", "question": "L'autonomie d'une batterie est une valeur d'usage.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux, c'est de l'estime", "correct": false}, {"texte": "Faux, c'est un prix", "correct": false}, {"texte": "Impossible à classer", "correct": false}]},
        {"id": "q15", "question": "La restitution orale permet le débat contradictoire et le bilan du chapitre.", "options": [{"texte": "Vrai", "correct": true}, {"texte": "Faux", "correct": false}, {"texte": "Seulement si l'enseignant est absent", "correct": false}, {"texte": "Inutile", "correct": false}]}
    ],
    "evaluation": [
        {
            "id": "ex1", "type": "tableau-menu", "niveau": "Facile",
            "titre": "Ex1 - Étapes de la séance (3 pts)",
            "enonce": "Associe chaque étape du déroulement de séance à sa description.",
            "questions": [
                {"id": "ex1q1", "enonce": "Étape 1 : Introduction.", "options": [{"texte": "Cadre global & Objectifs", "correct": true}, {"texte": "Mises en situation", "correct": false}, {"texte": "Correction finale", "correct": false}, {"texte": "Apport théorique", "correct": false}], "pts": 0.75},
                {"id": "ex1q2", "enonce": "Étape 2 : Partie Cours.", "options": [{"texte": "Apport théorique CDCF", "correct": true}, {"texte": "Travail de groupe", "correct": false}, {"texte": "Présentation orale", "correct": false}, {"texte": "Tour de table", "correct": false}], "pts": 0.75},
                {"id": "ex1q3", "enonce": "Étape 3 : Partie Exercices.", "options": [{"texte": "Atelier sur cas réel", "correct": true}, {"texte": "Bilan théorique", "correct": false}, {"texte": "Validation finale", "correct": false}, {"texte": "Intro générale", "correct": false}], "pts": 0.75},
                {"id": "ex1q4", "enonce": "Étape 4 : Restitution.", "options": [{"texte": "Débat & Correction", "correct": true}, {"texte": "Écriture du cours", "correct": false}, {"texte": "Choix des sous-groupes", "correct": false}, {"texte": "Saisie initiale", "correct": false}], "pts": 0.75}
            ]
        },
        {
            "id": "ex2", "type": "choix-multiple", "niveau": "Facile",
            "titre": "Ex2 - Outils de modélisation du besoin (3 pts)",
            "enonce": "Coche TOUS les outils d'expression et modélisation du besoin mentionnés.",
            "options": [
                {"texte": "Bête à cornes", "correct": true, "pts": 1},
                {"texte": "Diagramme Pieuvre", "correct": true, "pts": 1},
                {"texte": "Cahier des Charges Fonctionnel (CDCF)", "correct": true, "pts": 1},
                {"texte": "Diagramme de Gantt", "correct": false, "pts": 0},
                {"texte": "Schéma cinématique", "correct": false, "pts": 0}
            ]
        },
        {
            "id": "ex3", "type": "valeur-numerique", "niveau": "Moyen",
            "titre": "Ex3 - Nombre d'étapes (2 pts)",
            "enonce": "Combien d'étapes principales composent le déroulement de la séance du Module 2 ?",
            "bonnesReponses": ["4"],
            "pts": 2
        },
        {
            "id": "ex4", "type": "reponse-saisie", "niveau": "Moyen",
            "titre": "Ex4 - Sigle fondamental (2 pts)",
            "enonce": "Quel document formel récapitule les fonctions et critères de validation ? (Saisis le sigle)",
            "bonnesReponses": ["cdcf", "c.d.c.f"],
            "ignorerCasse": true,
            "ignorerAccents": true,
            "pts": 2
        },
        {
            "id": "ex5", "type": "association", "niveau": "Moyen",
            "titre": "Ex5 - Associer concepts du Module 2 (3 pts)",
            "enonce": "Associe chaque élément à sa définition ou rôle.",
            "associations": [
                {"terme": "Bête à cornes", "definition": "Exprime le besoin fondamental", "pts": 1},
                {"terme": "Diagramme Pieuvre", "definition": "Relie l'objet aux éléments extérieurs (FP / FC)", "pts": 1},
                {"terme": "Restitution", "definition": "Débat contradictoire et correction interactive", "pts": 1}
            ]
        },
        {
            "id": "ex6", "type": "texte-trous-libre", "niveau": "Moyen",
            "titre": "Ex6 - Compléter l'organisation (2 pts)",
            "enonce": "Complète le texte en saisissant les mots manquants.",
            "texte": "Le chapitre comprend deux parties : la partie {{}} pour la théorie et la partie {{}} pour l'application.",
            "trous": [
                {"bonnesReponses": ["cours"], "pts": 1},
                {"bonnesReponses": ["exercices", "exercice", "pratique"], "pts": 1}
            ]
        },
        {
            "id": "ex7", "type": "texte-trous-liste-unique", "niveau": "Moyen",
            "titre": "Ex7 - Modélisation du besoin (2 pts)",
            "enonce": "Complète le texte avec les options proposées.",
            "texte": "Pour la modélisation, on utilise le Diagramme {{}} et la Bête à {{}}.",
            "listeCommune": ["Pieuvre", "cornes", "CDCF", "Gantt", "Besoins"],
            "trous": [
                {"bonneReponse": "Pieuvre", "pts": 1},
                {"bonneReponse": "cornes", "pts": 1}
            ]
        },
        {
            "id": "ex8", "type": "texte-trous-liste-variable", "niveau": "Avancé",
            "titre": "Ex8 - Objectifs Pédagogiques (2 pts)",
            "enonce": "Complète la phrase caractérisant le programme.",
            "texte": "La théorie permet de maîtriser l'ingénierie des {{}}, puis la pratique permet de rédiger les critères de {{}}.",
            "trous": [
                {"liste": ["besoins", "outils", "diagrammes", "fonctions"], "bonneReponse": "besoins", "pts": 1},
                {"liste": ["validation", "fabrication", "vente", "conception"], "bonneReponse": "validation", "pts": 1}
            ]
        },
        {
            "id": "ex9", "type": "choix-unique", "niveau": "Facile",
            "titre": "Ex9 - Objectif de l'atelier pratique (3 pts)",
            "enonce": "Quel est le but principal de l'atelier pratique en sous-groupes ?",
            "options": [
                {"texte": "Appliquer la méthodologie sur un cas d'étude réel", "correct": true, "pts": 3},
                {"texte": "Recopier le cours théorique", "correct": false, "pts": 0},
                {"texte": "Calculer le coût total du projet", "correct": false, "pts": 0},
                {"texte": "Dessiner le logo du produit", "correct": false, "pts": 0}
            ]
        },
        {
            "id": "ex10", "type": "tableau-menu", "niveau": "Facile",
            "titre": "Ex10 - Identification des besoins clients (3 pts)",
            "enonce": "Pour chaque produit, identifie la Fonction Principale (FP) visée dans le CDCF.",
            "questions": [
                {"id": "ex10q1", "enonce": "Smartphone tout-terrain.", "options": [{"texte": "Communiquer en milieu hostile", "correct": true}, {"texte": "Remplacer un ordinateur", "correct": false}, {"texte": "Éclairer une pièce", "correct": false}], "pts": 0.6},
                {"id": "ex10q2", "enonce": "Robot aspirateur.", "options": [{"texte": "Nettoyer les sols en autonomie", "correct": true}, {"texte": "Chauffer la maison", "correct": false}, {"texte": "Surveiller les animaux", "correct": false}], "pts": 0.6},
                {"id": "ex10q3", "enonce": "Drone agricole.", "options": [{"texte": "Analyser les cultures à distance", "correct": true}, {"texte": "Transporter des passagers", "correct": false}, {"texte": "Arroser le jardin", "correct": false}], "pts": 0.6},
                {"id": "ex10q4", "enonce": "Casque anti-bruit actif.", "options": [{"texte": "Isoler des perturbations sonores", "correct": true}, {"texte": "Diffuser de la lumière", "correct": false}, {"texte": "Mesurer le rythme cardiaque", "correct": false}], "pts": 0.6},
                {"id": "ex10q5", "enonce": "Borne de recharge solaire.", "options": [{"texte": "Fournir de l'énergie propre", "correct": true}, {"texte": "Afficher l'heure", "correct": false}, {"texte": "Distribuer de l'eau", "correct": false}], "pts": 0.6}
            ]
        },
        {
            "id": "ex11", "type": "tableau-menu", "niveau": "Moyen",
            "titre": "Ex11 - Fonctions Principales vs Contraintes (3 pts)",
            "enonce": "Identifie s'il s'agit d'une Fonction Principale (FP) ou de Contrainte (FC).",
            "questions": [
                {"id": "ex11q1", "enonce": "Permettre à l'utilisateur de se déplacer.", "options": [{"texte": "Fonction Principale (FP)", "correct": true}, {"texte": "Fonction de Contrainte (FC)", "correct": false}], "pts": 0.6},
                {"id": "ex11q2", "enonce": "Respecter la norme de sécurité électrique CE.", "options": [{"texte": "Fonction de Contrainte (FC)", "correct": true}, {"texte": "Fonction Principale (FP)", "correct": false}], "pts": 0.6},
                {"id": "ex11q3", "enonce": "Résister aux projections d'eau (IP67).", "options": [{"texte": "Fonction de Contrainte (FC)", "correct": true}, {"texte": "Fonction Principale (FP)", "correct": false}], "pts": 0.6},
                {"id": "ex11q4", "enonce": "Permettre la saisie d'un texte par l'utilisateur.", "options": [{"texte": "Fonction Principale (FP)", "correct": true}, {"texte": "Fonction de Contrainte (FC)", "correct": false}], "pts": 0.6},
                {"id": "ex11q5", "enonce": "Avoir un poids inférieur à 1.5 kg.", "options": [{"texte": "Fonction de Contrainte (FC)", "correct": true}, {"texte": "Fonction Principale (FP)", "correct": false}], "pts": 0.6}
            ]
        },
        {
            "id": "ex12", "type": "tableau-menu", "niveau": "Moyen",
            "titre": "Ex12 - Caractérisation des critères CDCF (3 pts)",
            "enonce": "Associe la fonction à son critère d'évaluation.",
            "questions": [
                {"id": "ex12q1", "enonce": "Avoir une grande autonomie.", "options": [{"texte": "Durée de fonctionnement (heures)", "correct": true}, {"texte": "Poids total (kg)", "correct": false}, {"texte": "Couleur extérieure", "correct": false}], "pts": 0.6},
                {"id": "ex12q2", "enonce": "Être facilement transportable.", "options": [{"texte": "Masse max (kg) et dimensions", "correct": true}, {"texte": "Prix de vente (€)", "correct": false}, {"texte": "Vitesse d'impression", "correct": false}], "pts": 0.6},
                {"id": "ex12q3", "enonce": "Résister aux chocs.", "options": [{"texte": "Hauteur de chute supportée (m)", "correct": true}, {"texte": "Tension électrique (V)", "correct": false}, {"texte": "Temps de charge", "correct": false}], "pts": 0.6},
                {"id": "ex12q4", "enonce": "Recharger rapidement.", "options": [{"texte": "Temps de charge max (minutes)", "correct": true}, {"texte": "Distance de freinage", "correct": false}, {"texte": "Niveau sonore (dB)", "correct": false}], "pts": 0.6},
                {"id": "ex12q5", "enonce": "Ne pas être trop bruyant.", "options": [{"texte": "Niveau acoustique (dB)", "correct": true}, {"texte": "Consommation (W)", "correct": false}, {"texte": "Luminosité (lumens)", "correct": false}], "pts": 0.6}
            ]
        },
        {
            "id": "ex13", "type": "choix-multiple", "niveau": "Avancé",
            "titre": "Ex13 - Restitution & Évaluation (3 pts)",
            "enonce": "Coche TOUSES les actions réalisées lors de la Phase 4 (Restitution).",
            "options": [
                {"texte": "Présentation des travaux par les groupes", "correct": true, "pts": 1},
                {"texte": "Débat contradictoire avec l'audience", "correct": true, "pts": 1},
                {"texte": "Correction et bilan final du chapitre", "correct": true, "pts": 1},
                {"texte": "Rédaction initiale du cours par le professeur", "correct": false, "pts": 0},
                {"texte": "Validation immédiate du brevet industriel", "correct": false, "pts": 0}
            ]
        },
        {
            "id": "ex14", "type": "reponse-saisie", "niveau": "Avancé",
            "titre": "Ex14 - Saisie de vocabulaire (1 pt)",
            "enonce": "Quel diagramme relie l'objet aux éléments de son milieu extérieur ? (Diagramme ...)",
            "bonnesReponses": ["pieuvre"],
            "ignorerCasse": true,
            "ignorerAccents": true,
            "pts": 1
        },
        {
            "id": "ex15", "type": "tableau-menu", "niveau": "Avancé",
            "titre": "Ex15 - Analyse complète d'un projet d'étude (5 pts)",
            "enonce": "Projet : Conception d'une trottinette électrique pliante.",
            "questions": [
                {"id": "ex15q1", "enonce": "Saisie du besoin client principal ?", "options": [{"texte": "Se déplacer facilement en milieu urbain", "correct": true}, {"texte": "Remplacer un bus scolaire", "correct": false}, {"texte": "Faire de la compétition sportive", "correct": false}], "pts": 1},
                {"id": "ex15q2", "enonce": "Outil pour identifier 'À qui rend service l'objet' ?", "options": [{"texte": "Diagramme Bête à cornes", "correct": true}, {"texte": "Organigramme système", "correct": false}, {"texte": "Diagramme Pieuvre", "correct": false}], "pts": 1},
                {"id": "ex15q3", "enonce": "Élément du milieu extérieur (Diagramme Pieuvre) ?", "options": [{"texte": "Utilisateur et Chaussée/Sol", "correct": true}, {"texte": "Prix de l'essence", "correct": false}, {"texte": "Logiciel de DAO", "correct": false}], "pts": 1},
                {"id": "ex15q4", "enonce": "Document synthétisant la validation des fonctions ?", "options": [{"texte": "Cahier des Charges Fonctionnel (CDCF)", "correct": true}, {"texte": "Plan de fabrication", "correct": false}, {"texte": "Bon d'achat", "correct": false}], "pts": 1},
                {"id": "ex15q5", "enonce": "Dernière phase de validation en classe ?", "options": [{"texte": "Restitution orale et bilan du chapitre", "correct": true}, {"texte": "Achat des matières premières", "correct": false}, {"texte": "Contrôle individuel écrit sans correction", "correct": false}], "pts": 1}
            ]
        }
    ]
};

// ==========================================
// LOGIQUE DE L'APPLICATION
// ==========================================
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

let eleveInfo = { nom: '', prenom: '', classe: '', numero: '' };

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

function DémarrerApplication() {
    const form = $('#form-eleve');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            eleveInfo.nom = $('#eleve-nom').value.trim();
            eleveInfo.prenom = $('#eleve-prenom').value.trim();
            eleveInfo.classe = $('#eleve-classe').value;
            eleveInfo.numero = $('#eleve-numero').value.trim();

            if (eleveInfo.nom && eleveInfo.prenom && eleveInfo.classe && eleveInfo.numero) {
                $('#section-identification').classList.add('hidden');
                $('#section-cours').classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    initialiserCours();
    preparerQuiz();
    preparerEval();
}

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
                <strong>Focus du Module 2</strong>
                <p>${data.cours.introduction}</p>
            </div>
        </div>
    `;

    data.cours.sections.forEach((s, index) => {
        const iconClass = icons[index] || "fa-solid fa-bookmark";
        
        if (s.titre.includes("Déroulement")) {
            html += `
                <div class="cours-card full-width">
                    <div class="card-icon"><i class="${iconClass}"></i></div>
                    <div class="card-body">
                        <h3>${s.titre}</h3>
                        <p class="section-desc">${s.contenu}</p>
                        <div class="timeline-container">
                            <div class="timeline-step"><span class="step-num">1</span><span class="step-title">Introduction</span></div>
                            <div class="timeline-step"><span class="step-num">2</span><span class="step-title">Théorie</span></div>
                            <div class="timeline-step"><span class="step-num">3</span><span class="step-title">Pratique</span></div>
                            <div class="timeline-step"><span class="step-num">4</span><span class="step-title">Restitution</span></div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="cours-card">
                    <div class="card-icon"><i class="${iconClass}"></i></div>
                    <div class="card-body">
                        <h3>${s.titre}</h3>
                        <p>${s.contenu}</p>
                    </div>
                </div>
            `;
        }
    });

    $('#contenu-cours').innerHTML = html;
}

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
    timerQuiz = setInterval(() => {
        tempsQuizRestant--;
        $('#quiz-timer').textContent = `⏱️ ${formatTemps(tempsQuizRestant)}`;
        if (tempsQuizRestant <= 0) { clearInterval(timerQuiz); terminerQuiz(); }
    }, 1000);
}

$('#btn-suivant-quiz').addEventListener('click', () => {
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

function preparerEval() {
    evalQuestions = shuffle(data.evaluation);
    $('#btn-suivant-eval').addEventListener('click', () => validerEtSuivantEval());
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
    
    if (ex.type === 'tableau-menu') renderTableauMenu(ex, content);
    else if (ex.type === 'choix-unique') renderChoixUnique(ex, content);
    else if (ex.type === 'choix-multiple') renderChoixMultiple(ex, content);
    else if (ex.type === 'valeur-numerique') renderValeurNumerique(ex, content);
    else if (ex.type === 'reponse-saisie') renderReponseSaisie(ex, content);
    else if (ex.type === 'association') renderAssociation(ex, content);
    else if (ex.type === 'texte-trous-libre') renderTexteTrousLibre(ex, content);
    else if (ex.type === 'texte-trous-liste-unique') renderTexteTrousListeUnique(ex, content);
    else if (ex.type === 'texte-trous-liste-variable') renderTexteTrousListeVariable(ex, content);

    lancerTimerEval();
}

function lancerTimerEval() {
    clearInterval(timerEval);
    let tempsRestant = 90;
    $('#eval-timer').textContent = `⏱️ ${formatTemps(tempsRestant)}`;
    timerEval = setInterval(() => {
        tempsRestant--;
        $('#eval-timer').textContent = `⏱️ ${formatTemps(tempsRestant)}`;
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
    container.innerHTML = `<input type="text" id="valeur-numerique-input" placeholder="Saisis ta réponse numérique...">`;
}

function renderReponseSaisie(ex, container) {
    container.innerHTML = `<input type="text" id="reponse-saisie-input" placeholder="Saisis ta réponse...">`;
}

function renderAssociation(ex, container) {
    const div = document.createElement('div');
    div.className = 'association-container';
    const col = document.createElement('div');
    col.className = 'association-colonne';
    col.innerHTML = '<h4>Associe chaque terme :</h4>';
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
    const inputsHTML = ex.trous.map((trou, i) => `<input type="text" data-trou-index="${i}" data-pts="${trou.pts}" placeholder="..." class="trou-input">`);
    div.innerHTML = remplacerTrous(ex.texte, inputsHTML);
    container.appendChild(div);
}

function renderTexteTrousListeUnique(ex, container) {
    const div = document.createElement('div');
    div.className = 'texte-trous';
    const selectsHTML = ex.trous.map((trou, i) => {
        let opts = '<option value="">--</option>';
        ex.listeCommune.forEach(item => { opts += `<option value="${item}">${item}</option>`; });
        return `<select data-trou-index="${i}" data-pts="${trou.pts}">${opts}</select>`;
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
        return `<select data-trou-index="${i}" data-pts="${trou.pts}">${opts}</select>`;
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
    } else if (ex.type === 'choix-unique') {
        const sel = document.querySelector('input[name="choix-unique"]:checked');
        if (sel) {
            const opt = ex.options[parseInt(sel.value)];
            if (opt.correct) pts += opt.pts;
            details.questions.push({ enonce: ex.enonce, reponseEleve: opt.texte, bonneReponse: ex.options.find(o => o.correct).texte, correct: opt.correct, pts: opt.correct ? opt.pts : 0 });
        }
    } else if (ex.type === 'choix-multiple') {
        $$('#eval-content input[type="checkbox"]').forEach(cb => {
            const opt = ex.options[parseInt(cb.value)];
            const coche = cb.checked;
            if (coche && opt.correct) pts += opt.pts;
            details.questions.push({ enonce: opt.texte, reponseEleve: coche ? 'Coché' : 'Non coché', bonneReponse: opt.correct ? 'Coché' : 'Non coché', correct: coche === opt.correct, pts: (coche && opt.correct) ? opt.pts : 0 });
        });
    } else if (ex.type === 'valeur-numerique') {
        const val = ($('#valeur-numerique-input').value || '').replace(/\s/g, '').replace(',', '.');
        const correct = ex.bonnesReponses.some(r => r === val);
        if (correct) pts += ex.pts;
        details.questions.push({ enonce: ex.enonce, reponseEleve: val || 'Aucune', bonneReponse: ex.bonnesReponses[0], correct, pts: correct ? ex.pts : 0 });
    } else if (ex.type === 'reponse-saisie') {
        const val = normaliserTexte($('#reponse-saisie-input').value || '', ex.ignorerCasse, ex.ignorerAccents);
        const correct = ex.bonnesReponses.some(r => normaliserTexte(r, ex.ignorerCasse, ex.ignorerAccents) === val);
        if (correct) pts += ex.pts;
        details.questions.push({ enonce: ex.enonce, reponseEleve: val || 'Aucune', bonneReponse: ex.bonnesReponses[0], correct, pts: correct ? ex.pts : 0 });
    } else if (ex.type === 'association') {
        $$('#eval-content .association-item').forEach(item => {
            const terme = item.dataset.terme;
            const ptsA = parseFloat(item.dataset.pts);
            const val = item.querySelector('select').value;
            const correct = val === ex.associations.find(a => a.terme === terme).definition;
            if (correct) pts += ptsA;
            details.questions.push({ enonce: terme, reponseEleve: val || 'Aucune', bonneReponse: ex.associations.find(a => a.terme === terme).definition, correct, pts: correct ? ptsA : 0 });
        });
    } else if (ex.type === 'texte-trous-libre') {
        $$('#eval-content input[data-trou-index]').forEach(input => {
            const idx = parseInt(input.dataset.trouIndex);
            const ptsT = parseFloat(input.dataset.pts);
            const trou = ex.trous[idx];
            const val = normaliserTexte(input.value || '', true, true);
            const correct = trou.bonnesReponses.some(r => normaliserTexte(r, true, true) === val);
            if (correct) pts += ptsT;
            details.questions.push({ enonce: `Trou ${idx+1}`, reponseEleve: input.value || 'Aucune', bonneReponse: trou.bonnesReponses[0], correct, pts: correct ? ptsT : 0 });
        });
    } else if (ex.type === 'texte-trous-liste-unique' || ex.type === 'texte-trous-liste-variable') {
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
    $('#section-eval').classList.add('hidden');
    afficherResultats();
}

function afficherResultats() {
    const zone = $('#pdf-report-area');
    zone.classList.remove('hidden');

    $('#eleve-info-display').innerHTML = `
        <div class="eleve-card">
            <h3><i class="fa-solid fa-id-card"></i> Identité de l'Élève</h3>
            <p><strong>Nom :</strong> ${eleveInfo.nom} | <strong>Prénom :</strong> ${eleveInfo.prenom}</p>
            <p><strong>Classe :</strong> ${eleveInfo.classe} | <strong>N° :</strong> ${eleveInfo.numero}</p>
        </div>
    `;

    const totalQuiz = quizQuestions.length;
    const totalEval = 40;
    const total = scoreQuiz + scoreEval;
    const mention = total >= 36 ? '🏆 Excellent' : total >= 28 ? '👍 Très bien' : total >= 20 ? '✅ Bien' : total >= 12 ? '📚 À renforcer' : '⚠️ À retravailler';
    
    let html = `<div class="score-final">🎯 Bilan Module 2 : ${total.toFixed(1)} / ${totalQuiz + totalEval} pts<br><small>Théorie/Quiz : ${scoreQuiz}/${totalQuiz} | Pratique/Exercices : ${scoreEval.toFixed(1)}/${totalEval}</small><br><small>${mention}</small></div>`;
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
    const nomFichier = `Bilan_${eleveInfo.nom}_${eleveInfo.prenom}_Classe_${eleveInfo.classe}.pdf`;

    html2pdf().set({
        margin: [10,10,10,10],
        filename: nomFichier,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(el).save();
}

$('#btn-telecharger-pdf').addEventListener('click', genererPDFResultats);
$('#btn-recommencer').addEventListener('click', () => location.reload());

document.addEventListener('DOMContentLoaded', DémarrerApplication);
