// ===== script.js =====
// ===== script.js =====
let appData = null;
let quizIndex = 0, evalIndex = 0;
let quizAnswers = [], evalAnswers = [];
let quizTimerInterval, evalTimerInterval;
let quizTime = 20 * 60, evalTime = 60;
let quizSubmitted = false, evalSubmitted = false;
let quizQuestions = [], evalQuestions = [];

// Fonction de mélange Fisher-Yates
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Chargement des données
async function loadData() {
  try {
    const resp = await fetch('questions.json?t=' + Date.now());
    if (!resp.ok) throw new Error('Fetch failed');
    appData = await resp.json();
  } catch (e) {
    console.warn('Fallback JSON inline');
    const fallback = document.getElementById('fallback-json');
    appData = JSON.parse(fallback.textContent);
  }
  initApp();
}

function initApp() {
  // Cours
  const coursDiv = document.getElementById('cours-content');
  let html = `<p>${appData.cours.introduction}</p>`;
  appData.cours.sections.forEach(s => {
    html += `<h3>${s.titre}</h3>${s.contenu}`;
  });
  coursDiv.innerHTML = html;

  // Quiz
  quizQuestions = shuffleArray([...appData.quizComprehension]);
  quizAnswers = quizQuestions.map(() => null);
  renderQuiz();
  startQuizTimer();

  // Évaluation
  evalQuestions = shuffleArray([...appData.evaluation]);
  evalAnswers = evalQuestions.map(() => null);
  renderEval();
  startEvalTimer();

  // Événements
  document.getElementById('quiz-prev').addEventListener('click', () => changeQuiz(-1));
  document.getElementById('quiz-next').addEventListener('click', () => changeQuiz(1));
  document.getElementById('quiz-submit').addEventListener('click', submitQuiz);
  document.getElementById('eval-prev').addEventListener('click', () => changeEval(-1));
  document.getElementById('eval-next').addEventListener('click', () => changeEval(1));
  document.getElementById('eval-submit').addEventListener('click', submitEval);
  document.getElementById('download-pdf').addEventListener('click', genererPDFResultats);
}

// --- QUIZ ---
function renderQuiz() {
  const container = document.getElementById('quiz-container');
  const q = quizQuestions[quizIndex];
  if (!q) return;
  let html = `<div class="question"><strong>${q.question}</strong></div><div class="options">`;
  q.options.forEach((opt, i) => {
    const checked = (quizAnswers[quizIndex] === i) ? 'checked' : '';
    html += `<label class="option-item"><input type="radio" name="quiz-opt" value="${i}" ${checked}> ${opt}</label>`;
  });
  html += `</div>`;
  container.innerHTML = html;
  document.querySelectorAll('input[name="quiz-opt"]').forEach(inp => {
    inp.addEventListener('change', e => {
      quizAnswers[quizIndex] = parseInt(e.target.value);
    });
  });
  updateQuizNav();
}

function changeQuiz(delta) {
  const newIdx = quizIndex + delta;
  if (newIdx < 0 || newIdx >= quizQuestions.length) return;
  quizIndex = newIdx;
  renderQuiz();
}

function updateQuizNav() {
  document.getElementById('quiz-prev').disabled = quizIndex === 0;
  document.getElementById('quiz-next').disabled = quizIndex === quizQuestions.length - 1;
  document.getElementById('quiz-counter').textContent = `${quizIndex+1} / ${quizQuestions.length}`;
  const progress = ((quizIndex+1) / quizQuestions.length) * 100;
  document.querySelector('#quiz-progress .progress-fill').style.width = progress + '%';
  const submitBtn = document.getElementById('quiz-submit');
  if (quizIndex === quizQuestions.length - 1) {
    submitBtn.style.display = 'inline-block';
  } else {
    submitBtn.style.display = 'none';
  }
}

function startQuizTimer() {
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  quizTimerInterval = setInterval(() => {
    quizTime--;
    updateQuizTimerDisplay();
    if (quizTime <= 0) {
      clearInterval(quizTimerInterval);
      submitQuiz();
    }
  }, 1000);
}

function updateQuizTimerDisplay() {
  const m = String(Math.floor(quizTime / 60)).padStart(2,'0');
  const s = String(quizTime % 60).padStart(2,'0');
  document.getElementById('quiz-timer').textContent = `${m}:${s}`;
  if (quizTime < 10) document.getElementById('quiz-timer').style.color = 'red';
}

function submitQuiz() {
  if (quizSubmitted) return;
  quizSubmitted = true;
  clearInterval(quizTimerInterval);
  let score = 0;
  let details = [];
  quizQuestions.forEach((q, i) => {
    const ans = quizAnswers[i];
    const correct = (ans === q.reponse);
    if (correct) score++;
    details.push(`Q${i+1}: ${correct ? '✅' : '❌'} (${ans !== null ? q.options[ans] : 'non répondu'})`);
  });
  const total = quizQuestions.length;
  document.getElementById('quiz-result').innerHTML = `<h3>Résultat : ${score}/${total}</h3><ul><li>${details.join('</li><li>')}</li></ul>`;
  document.getElementById('quiz-submit').style.display = 'none';
  // Désactiver les radios
  document.querySelectorAll('#quiz-container input').forEach(inp => inp.disabled = true);
}

// --- ÉVALUATION ---
function renderEval() {
  const container = document.getElementById('eval-container');
  const ex = evalQuestions[evalIndex];
  if (!ex) return;
  let html = `<div class="question"><strong>${ex.question}</strong> <span class="badge">${ex.niveau}</span> (${ex.points} pts)</div>`;
  if (ex.type === 'qcm') {
    html += `<div class="options">`;
    ex.options.forEach((opt, i) => {
      const checked = (evalAnswers[evalIndex] && evalAnswers[evalIndex].includes(i)) ? 'checked' : '';
      html += `<label class="option-item"><input type="checkbox" value="${i}" ${checked}> ${opt}</label>`;
    });
    html += `</div>`;
  } else if (ex.type === 'association') {
    html += `<div class="association">`;
    ex.paires.forEach((paire, pi) => {
      html += `<div><strong>${paire.terme}</strong> : `;
      paire.definitions.forEach((def, di) => {
        const val = (evalAnswers[evalIndex] && evalAnswers[evalIndex][pi] === di) ? 'selected' : '';
        html += `<select data-pair="${pi}" data-def="${di}"><option value="">--</option><option value="${di}" ${val}>${def}</option></select> `;
      });
      html += `</div>`;
    });
    html += `</div>`;
  } else if (ex.type === 'redaction') {
    const val = evalAnswers[evalIndex] || '';
    html += `<textarea class="redaction-input" rows="4">${val}</textarea>`;
  } else if (ex.type === 'tableur') {
    const val = evalAnswers[evalIndex] || '';
    html += `<div class="tableur-custom"><input type="text" value="${val}" placeholder="Saisir la formule/ cellule"></div>`;
  }
  container.innerHTML = html;
  // Écouteurs
  if (ex.type === 'qcm') {
    container.querySelectorAll('input[type="checkbox"]').forEach(inp => {
      inp.addEventListener('change', e => {
        const checked = [...container.querySelectorAll('input:checked')].map(c => parseInt(c.value));
        evalAnswers[evalIndex] = checked;
      });
    });
  } else if (ex.type === 'association') {
    container.querySelectorAll('select').forEach(sel => {
      sel.addEventListener('change', e => {
        const pair = parseInt(sel.dataset.pair);
        const def = parseInt(sel.value);
        if (!evalAnswers[evalIndex]) evalAnswers[evalIndex] = {};
        evalAnswers[evalIndex][pair] = def;
      });
    });
  } else if (ex.type === 'redaction') {
    container.querySelector('textarea').addEventListener('input', e => {
      evalAnswers[evalIndex] = e.target.value;
    });
  } else if (ex.type === 'tableur') {
    container.querySelector('input').addEventListener('input', e => {
      evalAnswers[evalIndex] = e.target.value;
    });
  }
  updateEvalNav();
}

function changeEval(delta) {
  const newIdx = evalIndex + delta;
  if (newIdx < 0 || newIdx >= evalQuestions.length) return;
  evalIndex = newIdx;
  renderEval();
  resetEvalTimer();
}

function updateEvalNav() {
  document.getElementById('eval-prev').disabled = evalIndex === 0;
  document.getElementById('eval-next').disabled = evalIndex === evalQuestions.length - 1;
  document.getElementById('eval-counter').textContent = `${evalIndex+1} / ${evalQuestions.length}`;
  const progress = ((evalIndex+1) / evalQuestions.length) * 100;
  document.querySelector('#eval-progress .progress-fill').style.width = progress + '%';
  const submitBtn = document.getElementById('eval-submit');
  if (evalIndex === evalQuestions.length - 1) {
    submitBtn.style.display = 'inline-block';
  } else {
    submitBtn.style.display = 'none';
  }
}

function startEvalTimer() {
  if (evalTimerInterval) clearInterval(evalTimerInterval);
  evalTime = 60;
  updateEvalTimerDisplay();
  evalTimerInterval = setInterval(() => {
    evalTime--;
    updateEvalTimerDisplay();
    if (evalTime <= 0) {
      clearInterval(evalTimerInterval);
      if (evalIndex < evalQuestions.length - 1) {
        changeEval(1);
        startEvalTimer();
      } else {
        submitEval();
      }
    }
  }, 1000);
}

function resetEvalTimer() {
  clearInterval(evalTimerInterval);
  startEvalTimer();
}

function updateEvalTimerDisplay() {
  const m = String(Math.floor(evalTime / 60)).padStart(2,'0');
  const s = String(evalTime % 60).padStart(2,'0');
  const el = document.getElementById('eval-timer');
  el.textContent = `${m}:${s}`;
  if (evalTime < 10) {
    el.style.color = 'red';
    el.style.animation = 'blink 1s infinite';
  } else {
    el.style.color = '';
    el.style.animation = '';
  }
}

function submitEval() {
  if (evalSubmitted) return;
  evalSubmitted = true;
  clearInterval(evalTimerInterval);
  let totalPoints = 0;
  let details = [];
  let totalPossible = 0;
  evalQuestions.forEach((ex, i) => {
    totalPossible += ex.points;
    let ok = false;
    let detail = '';
    if (ex.type === 'qcm') {
      const ans = evalAnswers[i] || [];
      const correct = ex.reponses.sort().join(',') === [...ans].sort().join(',');
      ok = correct;
      detail = `Réponses: ${ans.length ? ans.map(a=>ex.options[a]).join(', ') : 'aucune'}`;
    } else if (ex.type === 'association') {
      const ans = evalAnswers[i] || {};
      let score = 0, total = 0;
      ex.paires.forEach((paire, pi) => {
        total++;
        if (ans[pi] !== undefined && ans[pi] === 0) score++; // simplifié
      });
      ok = (score === total);
      detail = `Associations: ${score}/${total}`;
    } else if (ex.type === 'redaction') {
      const ans = evalAnswers[i] || '';
      const mots = ex.motsCles || [];
      const found = mots.filter(m => ans.toLowerCase().includes(m.toLowerCase()));
      ok = found.length >= mots.length * 0.6;
      detail = `Mots-clés trouvés: ${found.join(', ')}`;
    } else if (ex.type === 'tableur') {
      const ans = evalAnswers[i] || '';
      ok = ans.trim().toUpperCase() === ex.reponse.toUpperCase();
      detail = `Réponse: ${ans || 'vide'}`;
    }
    if (ok) totalPoints += ex.points;
    details.push(`Ex${i+1} (${ex.niveau}) : ${ok ? '✅' : '❌'} - ${detail} (${ok ? ex.points : 0}/${ex.points} pts)`);
  });
  document.getElementById('eval-result').innerHTML = `<h3>Résultat : ${totalPoints}/${totalPossible}</h3><ul><li>${details.join('</li><li>')}</li></ul>`;
  document.getElementById('eval-submit').style.display = 'none';
  // Désactiver les inputs
  document.querySelectorAll('#eval-container input, #eval-container select, #eval-container textarea').forEach(el => el.disabled = true);

  // Afficher zone PDF
  document.getElementById('pdf-report-area').style.display = 'block';
  genererBilan(totalPoints);
}

// --- BILAN & PDF ---
function genererBilan(scoreEval) {
  const quizScore = quizAnswers.filter((a,i) => a === quizQuestions[i].reponse).length;
  const totalQuiz = quizQuestions.length;
  let mention = '';
  const total = scoreEval;
  if (total >= 36) mention = '🏆 Excellent';
  else if (total >= 28) mention = '👍 Très bien';
  else if (total >= 20) mention = '✅ Bien';
  else if (total >= 12) mention = '📚 À renforcer';
  else mention = '⚠️ À retravailler';

  const bilanDiv = document.getElementById('pdf-bilan');
  bilanDiv.innerHTML = `
    <p><strong>Quiz :</strong> ${quizScore}/${totalQuiz}</p>
    <p><strong>Évaluation :</strong> ${scoreEval}/40</p>
    <p><strong>Mention :</strong> ${mention}</p>
    <h4>Détail évaluation :</h4>
    <ul>${evalQuestions.map((ex,i) => `<li>Ex${i+1} (${ex.niveau}) : ${evalAnswers[i] ? '✅' : '❌'}</li>`).join('')}</ul>
  `;
}

function genererPDFResultats() {
  const element = document.getElementById('pdf-content');
  element.style.display = 'block';
  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: 'bilan_technologie_3eme.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 960 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  html2pdf().set(opt).from(element).save();
}

// Lancement
loadData();
