const TestPage = (() => {
  let questions = [];
  let settings = { secondsPerQuestion: 60, numQuestions: 25 };
  let currentIndex = 0;
  let selections = {}; // index -> optionIndex
  let timerId = null;
  let secondsLeft = 0;
  let startMs = 0;

  const els = {};

  function qs(id) { return document.getElementById(id); }

  function ensureRegistration() {
    const reg = Storage.get('registration');
    if (!reg) {
      window.location.href = 'index.html';
    }
    return reg;
  }

  function calculateCorrect() {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selections[idx] !== undefined && selections[idx] === q.answerIndex) {
        correct += 1;
      }
    });
    return correct;
  }

  function renderSidebar() {
    els.totalQuestions.textContent = String(questions.length);
    els.questionIndex.textContent = String(currentIndex + 1);
    const attempted = Object.keys(selections).length;
    els.attempted.textContent = String(attempted);
    const correct = calculateCorrect();
    els.correct.textContent = String(correct);
    
    // Update button states
    els.prevBtn.disabled = currentIndex === 0;
    if (currentIndex === questions.length - 1) {
      els.nextBtn.textContent = 'Finish';
    } else {
      els.nextBtn.textContent = 'Next';
    }
  }

  function renderQuestion() {
    const q = questions[currentIndex];
    els.questionText.textContent = q.text;
    els.options.innerHTML = '';
    q.options.forEach((opt, i) => {
      const div = document.createElement('label');
      div.className = 'option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'option';
      input.value = String(i);
      input.checked = selections[currentIndex] === i;
      input.addEventListener('change', () => {
        selections[currentIndex] = i;
        renderSidebar();
      });
      const span = document.createElement('span');
      span.textContent = opt;
      div.appendChild(input);
      div.appendChild(span);
      els.options.appendChild(div);
    });
    renderSidebar();
  }

  function updateTimer() {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const s = (secondsLeft % 60).toString().padStart(2, '0');
    els.timer.textContent = `${m}:${s}`;
    
    // Add visual warning when time is low
    const timerStat = els.timer.closest('.stat');
    if (timerStat) {
      if (secondsLeft <= 10) {
        timerStat.style.background = 'rgba(239, 68, 68, 0.1)';
        timerStat.style.borderRadius = '8px';
        timerStat.style.padding = '12px';
        timerStat.style.margin = '0 -12px';
        els.timer.style.color = '#ef4444';
        els.timer.style.animation = 'pulse 1s infinite';
      } else if (secondsLeft <= 30) {
        timerStat.style.background = 'rgba(245, 158, 11, 0.1)';
        timerStat.style.borderRadius = '8px';
        timerStat.style.padding = '12px';
        timerStat.style.margin = '0 -12px';
        els.timer.style.color = '#f59e0b';
        els.timer.style.animation = 'none';
      } else {
        timerStat.style.background = '';
        timerStat.style.borderRadius = '';
        timerStat.style.padding = '';
        timerStat.style.margin = '';
        els.timer.style.color = '#f59e0b';
        els.timer.style.animation = 'none';
      }
    }
  }

  function startQuestionTimer() {
    stopTimer();
    secondsLeft = settings.secondsPerQuestion;
    updateTimer();
    timerId = setInterval(() => {
      secondsLeft -= 1;
      updateTimer();
      if (secondsLeft <= 0) {
        next();
      }
    }, 1000);
  }

  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  function prev() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      renderQuestion();
      startQuestionTimer();
    }
  }

  function next() {
    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
      startQuestionTimer();
    } else {
      finish();
    }
  }

  function finish() {
    if (!confirm('Are you sure you want to finish the test? You cannot go back after submitting.')) {
      return;
    }
    stopTimer();
    const attempted = Object.keys(selections).length;
    const correct = calculateCorrect();
    const durationMs = Date.now() - startMs;
    const session = { attempted, correct, total: questions.length, selections, durationMs };
    Storage.set('testSession', session);
    const scorePct = (correct / questions.length) * 100;
    if (scorePct >= 70) window.location.href = 'clear.html';
    else window.location.href = 'lose.html';
  }

  async function init() {
    const reg = ensureRegistration();
    els.groupInfo = qs('groupInfo');
    els.totalQuestions = qs('totalQuestions');
    els.questionIndex = qs('questionIndex');
    els.timer = qs('timer');
    els.attempted = qs('attempted');
    els.correct = qs('correct');
    els.prevBtn = qs('prevBtn');
    els.nextBtn = qs('nextBtn');
    els.finishBtn = qs('finishBtn');
    els.questionText = qs('questionText');
    els.options = qs('options');

    els.groupInfo.textContent = `${reg.groupName} — ${reg.members.join(', ')}`;

    settings = await QuestionsAPI.getSettings();
    questions = await QuestionsAPI.getQuestions(settings.numQuestions);

    renderQuestion();
    renderSidebar();
    startMs = Date.now();
    startQuestionTimer();

    els.prevBtn.addEventListener('click', prev);
    els.nextBtn.addEventListener('click', next);
    els.finishBtn.addEventListener('click', finish);
  }

  return { init };
})();


