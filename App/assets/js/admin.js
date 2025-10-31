const AdminPage = (() => {
  const els = {};

  function qs(id) { return document.getElementById(id); }

  function renderQuestionItem(q, idx) {
    const root = document.createElement('div');
    root.className = 'q-item';

    const header = document.createElement('div');
    header.className = 'row';
    const title = document.createElement('strong');
    title.textContent = `Q${idx + 1}`;
    const remove = document.createElement('button');
    remove.className = 'btn danger';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      const idx = Number(root.dataset.index);
      questions.splice(idx, 1);
      renderList();
    });
    header.appendChild(title);
    header.appendChild(remove);

    const textField = document.createElement('div');
    textField.className = 'field';
    const ta = document.createElement('textarea');
    ta.rows = 2;
    ta.value = q.text || '';
    ta.addEventListener('input', () => { q.text = ta.value; });
    textField.appendChild(ta);

    const optsWrapper = document.createElement('div');
    for (let i = 0; i < 4; i++) {
      const optDiv = document.createElement('div');
      optDiv.className = 'q-option';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = `Option ${i + 1}`;
      input.value = q.options[i] || '';
      input.addEventListener('input', () => { q.options[i] = input.value; });
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `ans-${idx}`;
      radio.checked = q.answerIndex === i;
      radio.addEventListener('change', () => { q.answerIndex = i; });
      optDiv.appendChild(input);
      optDiv.appendChild(radio);
      optsWrapper.appendChild(optDiv);
    }

    root.appendChild(header);
    root.appendChild(textField);
    root.appendChild(optsWrapper);
    return root;
  }

  function renderList(searchTerm = '') {
    els.questionsList.innerHTML = '';
    const searchLower = searchTerm.toLowerCase();
    const filtered = searchTerm 
      ? questions.filter((q, i) => {
          const questionText = (q.text || '').toLowerCase();
          const optionText = (q.options || []).join(' ').toLowerCase();
          return questionText.includes(searchLower) || optionText.includes(searchLower);
        })
      : questions;
    
    if (filtered.length === 0 && questions.length > 0) {
      els.questionsList.innerHTML = '<div class="no-results">🔍 No questions match your search.</div>';
      return;
    }
    
    filtered.forEach((q, i) => {
      const originalIndex = questions.indexOf(q);
      const item = renderQuestionItem(q, originalIndex);
      item.dataset.index = String(originalIndex);
      els.questionsList.appendChild(item);
    });
    
    updateStats();
    updateEmptyState();
  }
  
  function updateStats() {
    const totalQuestionsStat = document.getElementById('totalQuestionsStat');
    const timePerQuestionStat = document.getElementById('timePerQuestionStat');
    if (totalQuestionsStat) {
      totalQuestionsStat.textContent = questions.length;
    }
    if (timePerQuestionStat && els.secondsPerQuestion) {
      timePerQuestionStat.textContent = `${els.secondsPerQuestion.value}s`;
    }
  }
  
  function updateEmptyState() {
    const noQuestionsMsg = document.getElementById('noQuestionsMsg');
    if (noQuestionsMsg) {
      noQuestionsMsg.style.display = questions.length === 0 ? 'block' : 'none';
      els.questionsList.style.display = questions.length === 0 ? 'none' : 'block';
    }
  }

  function addQuestion() {
    questions.push({ text: '', options: ['', '', '', ''], answerIndex: 0 });
    renderList();
  }

  async function saveSettings() {
    try {
      const numQuestions = Number(els.numQuestions.value);
      const secondsPerQuestion = Number(els.secondsPerQuestion.value);
      if (numQuestions < 1 || secondsPerQuestion < 5) {
        alert('Invalid settings. Minimum: 1 question, 5 seconds per question.');
        return;
      }
      await QuestionsAPI.saveSettings({ numQuestions, secondsPerQuestion });
      updateStats();
      showNotification('✅ Settings saved successfully!', 'success');
    } catch (e) {
      console.error(e);
      showNotification('⚠️ Failed to save settings. ' + (e.message || 'Please check Firebase configuration.'), 'error');
    }
  }
  
  function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  async function saveQuestions() {
    try {
      // simple validation
      for (const [i, q] of questions.entries()) {
        if (!q.text || q.options.some(o => !o)) {
          showNotification(`⚠️ Please complete question ${i + 1}. All fields are required.`, 'error');
          return;
        }
      }
      if (questions.length === 0) {
        showNotification('⚠️ Please add at least one question before saving.', 'error');
        return;
      }
      await QuestionsAPI.overwriteQuestions(questions);
      updateStats();
      showNotification('✅ Questions saved successfully!', 'success');
    } catch (e) {
      console.error(e);
      showNotification('⚠️ Failed to save questions. ' + (e.message || 'Please check Firebase configuration.'), 'error');
    }
  }

  function exportJSON() {
    if (questions.length === 0) {
      alert('⚠️ No questions to export.');
      return;
    }
    const data = JSON.stringify(questions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.json';
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => alert('✅ Questions exported successfully!'), 100);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error('Invalid format');
        questions = parsed.map(q => ({
          text: q.text,
          options: q.options,
          answerIndex: Number(q.answerIndex) || 0
        }));
        renderList();
      } catch (e) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }

  let questions = [];

  async function init() {
    els.numQuestions = qs('numQuestions');
    els.secondsPerQuestion = qs('secondsPerQuestion');
    els.saveSettingsBtn = qs('saveSettingsBtn');
    els.addQuestionBtn = qs('addQuestionBtn');
    els.saveQuestionsBtn = qs('saveQuestionsBtn');
    els.exportBtn = qs('exportBtn');
    els.importInput = qs('importInput');
    els.questionsList = qs('questionsList');

    const settings = await QuestionsAPI.getSettings();
    els.numQuestions.value = settings.numQuestions;
    els.secondsPerQuestion.value = settings.secondsPerQuestion;

    questions = await QuestionsAPI.getQuestions(1000);
    renderList();

    // Search functionality
    const searchInput = qs('searchQuestions');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderList(e.target.value);
      });
    }

    // Update stats when settings change
    if (els.secondsPerQuestion) {
      els.secondsPerQuestion.addEventListener('input', updateStats);
    }

    els.saveSettingsBtn.addEventListener('click', saveSettings);
    els.addQuestionBtn.addEventListener('click', addQuestion);
    els.saveQuestionsBtn.addEventListener('click', saveQuestions);
    els.exportBtn.addEventListener('click', exportJSON);
    els.importInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) importJSON(e.target.files[0]);
      e.target.value = '';
    });
    
    updateStats();
    updateEmptyState();
  }

  return { init };
})();


