/**
 * Aptitude Live Firebase Configuration
 * This file uses the configuration for your project 'apti0test'
 * and initializes the global 'firebase' and 'db' variables 
 * required by your project's JavaScript files.
 */

// Your Firebase Configuration (Provided by the Console)
const firebaseConfig = {
  apiKey: "AIzaSyBO0tgvdEeJbusNwtB6zCUyHmtM4ZHnwKM",
  authDomain: "apti0test.firebaseapp.com",
  projectId: "apti0test",
  storageBucket: "apti0test.firebasestorage.app",
  messagingSenderId: "836698799271",
  appId: "1:836698799271:web:9d7a34f938ad8a6a9b6f82",
  measurementId: "G-G450EXXRBB"
};


// 1. Initialize the core Firebase App.
// This relies on the Firebase CDN scripts loaded in your HTML files.
const app = firebase.initializeApp(firebaseConfig);

// 2. Get a reference to the Firestore Database service.
// This creates the global 'db' variable used by your 'admin.js' and 'questions.js' files.
const db = firebase.firestore();
