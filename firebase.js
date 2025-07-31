// js/firebase.js

// Your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGKk5bekY9YQi-9VQCofm1xp2RH_6zN00",
    authDomain: "possys-93cc6.firebaseapp.com",
    projectId: "possys-93cc6",
    storageBucket: "possys-93cc6.firebasestorage.app",
    messagingSenderId: "198047186409",
    appId: "1:198047186409:web:25bc107d5342afbaa0df78"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Firestore reference
  const db = firebase.firestore();
  