// ============ VARIABLES GLOBALES ============
let data = null;
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

// ============ UTILITAIRES ============
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

// ============ CHARGEMENT ============
async function chargerDonnees() {
    try {
        const res = await fetch('questions.json?t=' + Date.now(), {
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
        console.log('✅ JSON chargé depuis questions.json');
    } catch (e) {
        console.warn('⚠️ Fetch échoué, fallback inline :', e.message);
        try {
            const inline = document.getElementById('questions-data-inline').textContent;
            data = JSON.parse(inline);
            console.log('✅ JSON chargé depuis le fallback inline');
        } catch (e2) {
            console.error('❌ Erreur fatale :', e2);
            afficherErreurFatale();
            return;
        }
    }
    initialiserCours();
    preparerQuiz();
    preparerEval();
}

function afficherErreurFatale() {
    document.body.innerHTML = `
        <div style="max-width:600px;margin:4rem auto;padding:2rem;background:#fee2e2;border:2px solid #ef4444;border-radius:12px;font-family:sans-serif;">
            <h2 style="color:#991b1b;">⚠️ Erreur critique</h2>
            <p>Impossible de charger les questions.</p>
            <button onclick="location.reload()" style="margin-top:1rem;padding:0.75rem 1.5rem;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;">🔄 Réessayer</button>
        </div>
    `;
}

// ============ COURS ============
function initialiserCours() {
    const conteneur = $('#contenu-cours');
    let html = `<div class="intro"><strong>🎯 Introduction :</strong> ${data.cours.introduction}</div>`;
    data.cours.sections.forEach(s => {
        html += `<div class="section-cours"><h3>${s.titre}</h3><p>${s.contenu}</p></div>`;
    });
    conteneur.innerHTML = html;
}

// ============ QUIZ ============
function preparerQuiz() {
    quizQuestions = shuffle(data.quizComprehension).map(q => ({
        ...q,
        options: shuffle(q.options)
    }));
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
    if (quizIndex >= quizQuestions.length) {
        terminerQuiz();
        return;
    }
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
    mettreAJourTimerQuiz();
    timerQuiz = setInterval(() => {
        tempsQuizRestant--;
        mettreAJourTimerQuiz();
        if (tempsQuizRestant <= 0) {
            clearInterval(timerQuiz);
            terminerQuiz();
        }
    }, 1000);
}

function mettreAJourTimerQuiz() {
    const t = $('#quiz-timer');
    t.textContent = `⏱️ ${formatTemps(tempsQuizRestant)}`;
    if (tempsQuizRestant < 60) t.classList.add('warning');
    else t.classList.remove('warning');
}

$('#btn-suivant-quiz').addEventListener('click', () => {
    const sel = document.querySelector('input[name="quiz-opt"]:checked');
    const q = quizQuestions[quizIndex];
    let bonne = false;
    if (sel) {
        const idx = parseInt(sel.value);
        bonne = q.options[idx].correct;
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

// ============ ÉVALUATION ============
function preparerEval() {
    evalQuestions = shuffle(data.evaluation);
    $('#btn-suivant-eval').addEventListener('click', () => validerEtSuivantEval(false));
}

function afficherExerciceEval() {
    if (evalIndex >= evalQuestions.length) {
        terminerEval();
        return;
    }
    const ex = evalQuestions[evalIndex];
    $('#eval-progress').textContent = `Exercice ${evalIndex + 1} / ${evalQuestions.length}`;
    $('#eval-progress-bar').style.width = `${(evalIndex / evalQuestions.length) * 100}%`;
    
    let badge = '';
    if (ex.niveau === 'Facile') badge = '<span class="badge badge-facile">Facile</span>';
    else if (ex.niveau === 'Moyen') badge = '<span class="badge badge-moyen">Moyen</span>';
    else badge = '<span class="badge badge-avance">Avancé</span>';
    
    $('#eval-question').innerHTML = `<strong>${ex.titre}</strong> ${badge}<br><br>${ex.enonce}`;
    
    const content = $('#eval-content');
    content.innerHTML = '';
    
    if (ex.type === 'tableau-menu') renderTableauMenu(ex, content);
    
    lancerTimerEval();
}

function lancerTimerEval() {
    clearInterval(timerEval);
    let tempsRestant = 60;
    const t = $('#eval-timer');
    t.textContent = `⏱️ ${formatTemps(tempsRestant)}`;
    t.classList.remove('warning');
    
    timerEval = setInterval(() => {
        tempsRestant--;
        t.textContent = `⏱️ ${formatTemps(tempsRestant)}`;
        if (tempsRestant < 10) t.classList.add('warning');
        if (tempsRestant <= 0) {
            clearInterval(timerEval);
            validerEtSuivantEval(true);
        }
    }, 1000);
}

function renderTableauMenu(ex, container) {
    const table = document.createElement('table');
    table.className = 'tableau-menu';
    
    // Mélanger les questions de l'exercice
    const questionsMelangees = shuffle([...ex.questions]);
    
    let thead = `<thead><tr>
        <th>N°</th>
        <th>Énoncé</th>
        <th>Ta réponse</th>
    </tr></thead>`;
    table.innerHTML = thead;
    
    const tbody = document.createElement('tbody');
    questionsMelangees.forEach((q, i) => {
        const tr = document.createElement('tr');
        
        // Colonne numéro
        const tdNum = document.createElement('td');
        tdNum.className = 'num';
        tdNum.textContent = i + 1;
        tr.appendChild(tdNum);
        
        // Colonne énoncé
        const tdEnonce = document.createElement('td');
        tdEnonce.className = 'enonce-cell';
        tdEnonce.textContent = q.enonce;
        tr.appendChild(tdEnonce);
        
        // Colonne réponse (menu déroulant)
        const tdRep = document.createElement('td');
        tdRep.className = 'reponse-cell';
        const select = document.createElement('select');
        select.dataset.questionId = q.id;
        select.dataset.pts = q.pts;
        
        // Option vide par défaut
        const optVide = document.createElement('option');
        optVide.value = '';
        optVide.textContent = '-- Choisir --';
        select.appendChild(optVide);
        
        // Mélanger les options
        const optionsMelangees = shuffle([...q.options]);
        optionsMelangees.forEach((opt, j) => {
            const option = document.createElement('option');
            option.value = opt.texte;
            option.dataset.correct = opt.correct;
            option.textContent = opt.texte;
            select.appendChild(option);
        });
        
        tdRep.appendChild(select);
        tr.appendChild(tdRep);
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
}

function validerEtSuivantEval(auto = false) {
    clearInterval(timerEval);
    const ex = evalQuestions[evalIndex];
    let pts = 0;
    const details = { titre: ex.titre, niveau: ex.niveau, questions: [] };
    
    if (ex.type === 'tableau-menu') {
        const selects = $$('#eval-content select');
        selects.forEach(select => {
            const qId = select.dataset.questionId;
            const qPts = parseFloat(select.dataset.pts);
            const selectedValue = select.value;
            const selectedOption = select.querySelector(`option[value="${CSS.escape(selectedValue)}"]`);
            
            // Retrouver la question dans l'exercice
            const questionData = ex.questions.find(q => q.id === qId);
            const bonneReponse = questionData.options.find(o => o.correct).texte;
            
            let correct = false;
            if (selectedValue && selectedOption && selectedOption.dataset.correct === 'true') {
                correct = true;
                pts += qPts;
            }
            
            details.questions.push({
                enonce: questionData.enonce,
                reponseEleve: selectedValue || 'Aucune réponse',
                bonneReponse: bonneReponse,
                correct: correct,
                pts: correct ? qPts : 0
            });
        });
    }
    
    scoreEval += pts;
    details.points = Math.round(pts * 10) / 10;
    details.totalPossible = ex.questions.reduce((sum, q) => sum + q.pts, 0);
    detailsEval.push(details);
    
    evalIndex++;
    afficherExerciceEval();
}

function terminerEval() {
    $('#section-eval').classList.add('hidden');
    afficherResultats();
}

// ============ RÉSULTATS ============
function afficherResultats() {
    const zone = $('#pdf-report-area');
    zone.classList.remove('hidden');
    
    const totalQuiz = quizQuestions.length;
    const totalEval = 40;
    const total = scoreQuiz + scoreEval;
    const mention = total >= 36 ? '🏆 Excellent' : total >= 28 ? '👍 Très bien' : total >= 20 ? '✅ Bien' : total >= 12 ? '📚 À renforcer' : '⚠️ À retravailler';
    
    let html = `
        <div class="score-final">
            🎯 Score total : ${total.toFixed(1)} / ${totalQuiz + totalEval} pts<br>
            <small>Quiz : ${scoreQuiz}/${totalQuiz} | Évaluation : ${scoreEval.toFixed(1)}/${totalEval}</small><br>
            <small>${mention}</small>
        </div>
        <div class="resultat-section">
            <h3>📋 Détail du Quiz</h3>`;
    detailsQuiz.forEach((d, i) => {
        html += `<div class="detail-exercice ${d.correct ? '' : 'erreur'}">
            <strong>Q${i+1}.</strong> ${d.question}<br>
            ${d.correct ? '✅ Bonne réponse' : `❌ Tu as répondu : "${d.reponseEleve}" — Attendu : "${d.bonneReponse}"`}
        </div>`;
    });
    html += `</div><div class="resultat-section"><h3>📝 Détail de l'évaluation (25 questions)</h3>`;
    detailsEval.forEach(d => {
        const nbBonnes = d.questions.filter(q => q.correct).length;
        const total = d.questions.length;
        const ok = nbBonnes === total;
        html += `<div class="detail-exercice ${ok ? '' : 'erreur'}">
            <strong>${d.titre}</strong> — ${d.points} / ${d.totalPossible} pts (${nbBonnes}/${total})<br>`;
        d.questions.forEach((q, i) => {
            html += `<div class="detail-question ${q.correct ? 'bonne' : 'mauvaise'}">
                ${q.correct ? '✅' : '❌'} <strong>Q${i+1}.</strong> ${q.enonce}<br>
                ${q.correct 
                    ? `<em>Ta réponse : ${q.reponseEleve}</em>` 
                    : `<em>Tu as répondu : "${q.reponseEleve}" — Attendu : "${q.bonneReponse}"</em>`}
            </div>`;
        });
        html += `</div>`;
    });
    html += `</div>`;
    
    $('#resultats-detail').innerHTML = html;
    zone.scrollIntoView({ behavior: 'smooth' });
}

// ============ GÉNÉRATION PDF ============
function genererPDFResultats() {
    const element = $('#pdf-report-area');
    element.classList.remove('hidden');
    element.style.display = 'block';
    
    // Remplacer les selects par leur valeur texte pour le PDF
    const selects = element.querySelectorAll('select');
    selects.forEach(s => {
        const span = document.createElement('span');
        span.textContent = s.options[s.selectedIndex]?.text || '(non répondu)';
        span.style.fontWeight = '600';
        s.parentNode.replaceChild(span, s);
    });
    
    setTimeout(() => {
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Rapport_Technologie_${new Date().toISOString().slice(0,10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                backgroundColor: '#ffffff',
                scrollY: 0,
                windowWidth: 960
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save()
            .then(() => console.log('✅ PDF généré'))
            .catch(err => {
                console.error('❌ Erreur PDF :', err);
                alert('Erreur lors de la génération du PDF.');
            });
    }, 100);
}

$('#btn-telecharger-pdf').addEventListener('click', genererPDFResultats);
$('#btn-recommencer').addEventListener('click', () => location.reload());

// ============ DÉMARRAGE ============
document.addEventListener('DOMContentLoaded', chargerDonnees);
