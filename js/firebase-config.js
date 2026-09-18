import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, push, update, remove, set } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

// Client-side Firebase Configuration (authenticated & protected by Firebase RTDB Security Rules)
const firebaseConfig = {
  apiKey: "AIzaSyCM0dkd03E73aLWGrMtt3xtSrDra4Pm_eA",
  authDomain: "mahendra-portfolio-436ce.firebaseapp.com",
  databaseURL: "https://mahendra-portfolio-436ce-default-rtdb.firebaseio.com",
  projectId: "mahendra-portfolio-436ce",
  storageBucket: "mahendra-portfolio-436ce.firebasestorage.app",
  messagingSenderId: "590050555393",
  appId: "1:590050555393:web:c307841645de948053f200",
  measurementId: "G-5CME5TQGTB"
};

let app = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (err) {
  console.warn("Firebase initialization notice:", err.message || err);
}

export { app, db, ref, onValue, runTransaction, push, update, remove, set };
