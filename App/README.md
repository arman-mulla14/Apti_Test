## Aptitude Live (Static Site)

Static website for aptitude tests with group registration, timed questions, pass/fail, and admin console. Uses LocalStorage and optional Firebase (free plan) for persistent questions/settings.

### Features

- Group registration (min 4, max 6). Single-member allowed with password `PassStudent`.
- Timed test with per-question countdown. Default 25 questions.
- Pass threshold: 70% → goes to `clear.html`, else `lose.html`.
- Admin page to edit settings and questions; import/export JSON.
- Firebase Hosting config included.

### Structure

```
index.html
test.html
clear.html
lose.html
admin.html
assets/css/styles.css
assets/js/{storage,common,questions,test,admin}.js
config/firebase.js
firebase.json, .firebaserc
```

### Firebase (Free Plan)

1. Create a project and a Web App in Firebase console.
2. Paste your config into `config/firebase.js` and initialize the app.
3. Enable Firestore. Create collections: `config/settings` (doc) and `questions` (docs).
4. Deploy with `firebase deploy` (after `firebase init hosting`).

Basic Firestore rules for demo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/{doc} { allow read: if true; allow write: if true; }
    match /questions/{doc} { allow read: if true; allow write: if true; }
  }
}
```

Tighten writes in production.
