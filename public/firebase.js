// ===== Firebase Configuration =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAA1fTstrTFUQcWYNCDEj7vHEka8VEgzyU",
  authDomain: "tarot-91b8c.firebaseapp.com",
  projectId: "tarot-91b8c",
  storageBucket: "tarot-91b8c.firebasestorage.app",
  messagingSenderId: "587662102406",
  appId: "1:587662102406:web:02d49811d4ba52d4796607",
  measurementId: "G-YELCMXH484"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };