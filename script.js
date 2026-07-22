// Variable d'état global
let appData = null;
let currentQuizIndex = 0;
let quizScore = 0;
let quizTimerInterval = null;
let quizTimeRemaining = 1200; // 20 minutes

let currentEvalIndex = 0;
let evalScore = 0;
let evalMaxPoints = 40;
let evalTimerInterval = null;
let evalTimeRemaining = 90; // 1 min 30 s
let userEvalAnswers = [];

// Chargement Résilient des Données (JSON Externe -> Fallback Inline)
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('questions.json');
    if (!response.ok) throw new Error('Erreur HTTP ' + response.status);
    appData = await response.json();
  } catch (err) {
    console.warn('Chargement de questions.json échoué. Bascule sur la balise inline HTML.', err);
    const inlineScript = document.getElementById('questions-data-inline');
    if (inlineScript) {
      appData = JSON.parse(inlineScript.textContent);
    } else {
      alert("Erreur critique : Impossible de charger les données du module.");
      return;
    }
  }

  // Mélange aléatoire
  shuffleArray(appData.quiz);
  appData.quiz.forEach(q => shuffleArray(q.options));
  shuffleArray(appData.evaluations);

  initCours();
});

// Fonctions Utilitaires
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function normalizeString(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Navigation entre Sections
function switchSection(secId) {
  document.querySelectorAll('.card-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`sec-${secId}`).classList.add('active');
  document.getElementById(`nav-${secId}`).classList.add('active');
}

// SECTION 1 : COURS
function initCours() {
  const container = document.getElementById('cours-content');
  container.innerHTML = appData.cours.notions.map(n => `
    <div class="cours-card">
      <h3>${n.titre}</h3>
      <p>${n.contenu}</p>
    </div>
  `).join('');
}

function startQuiz() {
  switchSection('quiz');
  currentQuizIndex = 0;
  quizScore = 0;
  startQuizTimer();
  renderQuizQuestion();
}

// SECTION 2 : QUIZ
function startQuizTimer() {
  clearInterval(quizTimerInterval);
  quizTimeRemaining = 1200; // 20 min
  const timerDisplay = document.getElementById('quiz-timer');

  quizTimerInterval = setInterval(() => {
    quizTimeRemaining--;
    const min = String(Math.floor(quizTimeRemaining / 60)).padStart(2, '0');
    const sec = String(quizTimeRemaining % 60).padStart(2, '0');
    timerDisplay.textContent = `Temps restant : ${min}:${sec}`;

    if (quizTimeRemaining <= 60) {
      timerDisplay.classList.add('blink');
    }

    if (quizTimeRemaining <= 0) {
      clearInterval(quizTimerInterval);
      alert('Temps écoulé pour le quiz !');
      finishQuiz();
    }
  }, 1000);
}

function renderQuizQuestion() {
  const q = appData.quiz[currentQuizIndex];
  const container = document.getElementById('quiz-card');
  
  document.getElementById('quiz-counter').textContent = `Question ${currentQuizIndex + 1} / ${appData.quiz.length}`;
  document.getElementById('quiz-progress').style.width = `${((currentQuizIndex) / appData.quiz.length) * 100}%`;

  container.innerHTML = `
    <div class="question-title">${q.question}</div>
    <div class="options-list">
      ${q.options.map((opt, idx) => `
        <label class="option-item">
          <input type="radio" name="quiz-opt" value="${idx}">
          <span>${opt}</span>
        </label>
      `).join('')}
    </div>
  `;
}

function nextQuizQuestion() {
  const selected = document.querySelector('input[name="quiz-opt"]:checked');
  if (selected) {
    if (parseInt(selected.value) === appData.quiz[currentQuizIndex].reponse) {
      quizScore++;
    }
  }

  currentQuizIndex++;
  if (currentQuizIndex < appData.quiz.length) {
    renderQuizQuestion();
  } else {
    clearInterval(quizTimerInterval);
    finishQuiz();
  }
}

function finishQuiz() {
  alert(`Quiz terminé ! Votre score : ${quizScore} / ${appData.quiz.length}`);
  switchSection('eval');
  startEvalTimer();
  renderEvalQuestion();
}

// SECTION 3 : ÉVALUATION (Moteur de Rendu)
function startEvalTimer() {
  clearInterval(evalTimerInterval);
  evalTimeRemaining = 90; // 1 min 30 s par question
  const timerDisplay = document.getElementById('eval-timer');
  timerDisplay.classList.remove('blink');

  evalTimerInterval = setInterval(() => {
    evalTimeRemaining--;
    const min = String(Math.floor(evalTimeRemaining / 60)).padStart(2, '0');
    const sec = String(evalTimeRemaining % 60).padStart(2, '0');
    timerDisplay.textContent = `Temps question : ${min}:${sec}`;

    if (evalTimeRemaining <= 10) {
      timerDisplay.classList.add('blink');
    }

    if (evalTimeRemaining <= 0) {
      clearInterval(evalTimerInterval);
      nextEvalQuestion(true); // Auto-validation à l'expiration
    }
  }, 1000);
}

function renderEvalQuestion() {
  const ex = appData.evaluations[currentEvalIndex];
  const container = document.getElementById('eval-card');

  document.getElementById('eval-counter').textContent = `Exercice ${currentEvalIndex + 1} / ${appData.evaluations.length} (${ex.points} pts)`;
  document.getElementById('eval-progress').style.width = `${((currentEvalIndex) / appData.evaluations.length) * 100}%`;

  let html = `<div class="question-title">${ex.consigne}</div>`;

  switch (ex.type) {
    case 'tableau-menu':
      html += `
        <table class="eval-table">
          <thead><tr><th>Élément</th><th>Choix</th></tr></thead>
          <tbody>
            ${ex.lignes.map((l, i) => `
              <tr>
                <td>${l.element}</td>
                <td>
                  <select class="eval-input" data-index="${i}">
                    <option value="">-- Sélectionner --</option>
                    ${l.options.map(o => `<option value="${o}">${o}</option>`).join('')}
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
      break;

    case 'choix-unique':
      html += `
        <div class="options-list">
          ${ex.options.map((o, i) => `
            <label class="option-item">
              <input type="radio" name="eval-opt" class="eval-input" value="${i}">
              <span>${o}</span>
            </label>
          `).join('')}
        </div>`;
      break;

    case 'choix-multiple':
      html += `
        <div class="options-list">
          ${ex.options.map((o, i) => `
            <label class="option-item">
              <input type="checkbox" class="eval-input" value="${i}">
              <span>${o.texte}</span>
            </label>
          `).join('')}
        </div>`;
      break;

    case 'valeur-numerique':
    case 'reponse-saisie':
      html += `<input type="text" class="eval-input" placeholder="Saisissez votre réponse ici...">`;
      break;

    case 'association':
      html += ex.pairs.map((p, i) => `
        <div class="assoc-grid">
          <div><strong>${p.terme}</strong></div>
          <select class="eval-input" data-index="${i}">
            <option value="">-- Associer --</option>
            ${ex.pairs.map(d => `<option value="${d.definition}">${d.definition}</option>`).join('')}
          </select>
        </div>
      `).join('');
      break;

    case 'texte-trous-libre':
      html += `<p>${ex.texte_avant} <input type="text" class="eval-input fill-inline"> ${ex.texte_apres}</p>`;
      break;

    case 'texte-trous-liste-unique':
      html += `<p>${ex.texte_avant} 
        <select class="eval-input fill-inline">
          <option value="">-- Choix --</option>
          ${ex.options.map(o => `<option value="${o}">${o}</option>`).join('')}
        </select> 
      ${ex.texte_apres}</p>`;
      break;

    case 'texte-trous-liste-variable':
      html += `<p>${ex.segments.map(s => {
        if (s.id) {
          return `<select class="eval-input fill-inline" data-id="${s.id}">
            <option value="">-- Choix --</option>
            ${s.options.map(o => `<option value="${o}">${o}</option>`).join('')}
          </select>`;
        }
        return s.texte;
      }).join('')}</p>`;
      break;
  }

  container.innerHTML = html;
  startEvalTimer();
}

// Correction et calcul des scores d'évaluation
function evaluateCurrentAnswer() {
  const ex = appData.evaluations[currentEvalIndex];
  let pointsGagnes = 0;
  let reponseEleve = null;

  switch (ex.type) {
    case 'tableau-menu':
      const selects = document.querySelectorAll('.eval-input');
      let tCorrect = 0;
      reponseEleve = [];
      selects.forEach(s => {
        const idx = s.dataset.index;
        reponseEleve.push(s.value);
        if (s.value === ex.lignes[idx].reponse) tCorrect++;
      });
      pointsGagnes = (tCorrect / ex.lignes.length) * ex.points;
      break;

    case 'choix-unique':
      const checkedOpt = document.querySelector('input[name="eval-opt"]:checked');
      if (checkedOpt) {
        reponseEleve = parseInt(checkedOpt.value);
        if (reponseEleve === ex.reponse) pointsGagnes = ex.points;
      }
      break;

    case 'choix-multiple':
      const chks = document.querySelectorAll('.eval-input');
      let mPoints = 0;
      reponseEleve = [];
      const ptParCoche = ex.points / ex.options.length;
      chks.forEach((c, idx) => {
        const isChecked = c.checked;
        reponseEleve.push(isChecked);
        if (isChecked === ex.options[idx].correct) {
          mPoints += ptParCoche;
        }
      });
      pointsGagnes = mPoints;
      break;

    case 'valeur-numerique':
      const valInput = document.querySelector('.eval-input').value.trim();
      reponseEleve = valInput;
      if (parseFloat(valInput) === parseFloat(ex.reponse)) pointsGagnes = ex.points;
      break;

    case 'reponse-saisie':
    case 'texte-trous-libre':
      const txtInput = document.querySelector('.eval-input').value;
      reponseEleve = txtInput;
      const normalizedInput = normalizeString(txtInput);
      const valids = ex.reponses_valides || ex.reponse_valide;
      const isValid = Array.isArray(valids) 
        ? valids.some(v => normalizeString(v) === normalizedInput)
        : normalizeString(valids) === normalizedInput;
      if (isValid) pointsGagnes = ex.points;
      break;

    case 'association':
      const assocSelects = document.querySelectorAll('.eval-input');
      let aCorrect = 0;
      reponseEleve = [];
      assocSelects.forEach(s => {
        const idx = s.dataset.index;
        reponseEleve.push(s.value);
        if (s.value === ex.pairs[idx].definition) aCorrect++;
      });
      pointsGagnes = (aCorrect / ex.pairs.length) * ex.points;
      break;

    case 'texte-trous-liste-unique':
      const selOpt = document.querySelector('.eval-input').value;
      reponseEleve = selOpt;
      if (selOpt === ex.reponse) pointsGagnes = ex.points;
      break;

    case 'texte-trous-liste-variable':
      const segSelects = document.querySelectorAll('.eval-input');
      let segCorrect = 0;
      reponseEleve = {};
      const totalSegs = ex.segments.filter(s => s.id).length;
      segSelects.forEach(s => {
        const id = s.dataset.id;
        reponseEleve[id] = s.value;
        const targetSeg = ex.segments.find(sg => sg.id === id);
        if (targetSeg && s.value === targetSeg.reponse) segCorrect++;
      });
      pointsGagnes = (segCorrect / totalSegs) * ex.points;
      break;
  }

  evalScore += pointsGagnes;
  userEvalAnswers.push({
    exercice: ex,
    pointsObtenus: pointsGagnes,
    reponseEleve: reponseEleve
  });
}

function nextEvalQuestion(auto = false) {
  clearInterval(evalTimerInterval);
  evaluateCurrentAnswer();

  currentEvalIndex++;
  if (currentEvalIndex < appData.evaluations.length) {
    renderEvalQuestion();
  } else {
    finishEvaluation();
  }
}

function finishEvaluation() {
  switchSection('bilan');
  renderBilan();
}

// SECTION 4 : BILAN
function renderBilan() {
  document.getElementById('quiz-score-display').textContent = `${quizScore} / ${appData.quiz.length}`;
  
  const scoreArrondi = Math.round(evalScore * 10) / 10;
  document.getElementById('eval-score-display').textContent = `${scoreArrondi} / 40`;

  const levelBadge = document.getElementById('level-display');
  if (scoreArrondi >= 32) {
    levelBadge.textContent = "Excellent";
    levelBadge.style.background = "#00b894";
  } else if (scoreArrondi >= 24) {
    levelBadge.textContent = "Bon niveau";
    levelBadge.style.background = "#0984e3";
  } else if (scoreArrondi >= 16) {
    levelBadge.textContent = "À consolider";
    levelBadge.style.background = "#fdcb6e";
  } else {
    levelBadge.textContent = "À retravailler";
    levelBadge.style.background = "#d63031";
  }

  const corrContainer = document.getElementById('corrections-list');
  corrContainer.innerHTML = userEvalAnswers.map((res, i) => {
    const isSuccess = res.pointsObtenus === res.exercice.points;
    return `
      <div class="corr-item ${isSuccess ? 'correct' : ''}">
        <h4>Exercice ${i + 1} : ${res.exercice.consigne} (${res.pointsObtenus.toFixed(1)} / ${res.exercice.points} pts)</h4>
        <p><strong>Statut :</strong> ${isSuccess ? 'Réussi' : 'Incomplet ou Incorrect'}</p>
      </div>
    `;
  }).join('');
}

function exportPDF() {
  const element = document.getElementById('pdf-report');
  const opt = {
    margin:       0.5,
    filename:     'Bilan_Technologie_3eme_Analyse_Besoin.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

function resetModule() {
  location.reload();
}
