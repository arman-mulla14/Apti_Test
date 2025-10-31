const QuestionsAPI = (() => {
  const defaultSettings = { secondsPerQuestion: 60, numQuestions: 25 };
  const defaultQuestions = [
    {
      id: 'q1',
      text: 'What is the next number in the series: 2, 6, 12, 20, ?',
      options: ['24', '30', '28', '40'],
      answerIndex: 2
    },
    {
      id: 'q2',
      text: 'If A=1, B=2, ... Z=26, what is the value of CAT?',
      options: ['24', '27', '26', '29'],
      answerIndex: 3
    }
  ];

  function hasFirebase() {
    return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
  }

  async function getSettings() {
    try {
      if (!hasFirebase()) return defaultSettings;
      const db = firebase.firestore();
      const doc = await db.collection('config').doc('settings').get();
      if (doc.exists) return Object.assign({}, defaultSettings, doc.data());
      return defaultSettings;
    } catch (e) {
      console.warn('Using default settings due to error:', e);
      return defaultSettings;
    }
  }

  async function getQuestions(limitTo) {
    try {
      if (!hasFirebase()) return defaultQuestions.slice(0, limitTo);
      const db = firebase.firestore();
      const snap = await db.collection('questions').orderBy('createdAt', 'asc').get();
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const normalized = all.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options,
        answerIndex: q.answerIndex
      }));
      if (!normalized.length) return defaultQuestions.slice(0, limitTo);
      return normalized.slice(0, limitTo);
    } catch (e) {
      console.warn('Using default questions due to error:', e);
      return defaultQuestions.slice(0, limitTo);
    }
  }

  async function saveSettings(settings) {
    if (!hasFirebase()) throw new Error('Firebase not configured');
    const db = firebase.firestore();
    await db.collection('config').doc('settings').set({
      secondsPerQuestion: Number(settings.secondsPerQuestion),
      numQuestions: Number(settings.numQuestions),
      updatedAt: Date.now()
    }, { merge: true });
  }

  async function overwriteQuestions(questions) {
    if (!hasFirebase()) throw new Error('Firebase not configured');
    const db = firebase.firestore();
    const batch = db.batch();
    // Delete existing
    const existing = await db.collection('questions').get();
    existing.forEach(doc => batch.delete(doc.ref));
    // Add new
    questions.forEach(q => {
      const ref = db.collection('questions').doc();
      batch.set(ref, {
        text: q.text,
        options: q.options,
        answerIndex: Number(q.answerIndex),
        createdAt: Date.now()
      });
    });
    await batch.commit();
  }

  return { getSettings, getQuestions, saveSettings, overwriteQuestions };
})();


