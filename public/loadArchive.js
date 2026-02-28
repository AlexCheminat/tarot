import { db } from './firebase.js';
import {
  collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ALLOWED_FINGERPRINT = "1d68d64bae517b9ea2b7821dbde959baabb865741c57bee252e59acda0bb8c2f";

async function getDeviceFingerprint() {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    navigator.platform
  ].join('|');

  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function loadArchive() {
  const q = query(collection(db, 'score_archive'), orderBy('time_created', 'asc'));
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  const container = document.getElementById("scoreArchive");
  container.innerHTML = '';

  const currentFingerprint = await getDeviceFingerprint();
  const isAuthorized = currentFingerprint === ALLOWED_FINGERPRINT;

  data.forEach(entry => {
    const button = document.createElement('button');
    button.className = 'score-entry';
    button.dataset.id = entry.id;

    let contrat = '';
    switch (entry.contrat) {
      case '1': case 1: contrat = 'Prise'; break;
      case '2': case 2: contrat = 'Garde'; break;
      case '3': case 3: contrat = 'Garde Sans'; break;
      case '4': case 4: contrat = 'Garde Contre'; break;
    }

    if (entry.equipier_nom === null) {
      button.innerHTML = `
        Preneur (${entry.preneur_nom}): ${entry.preneur_score}<br>
        Defense (${entry.defense_nom}): ${entry.defense_score}<br>
        Points: ${entry.points}, Contrat: ${contrat}, Bout: ${entry.bout}
      `;
    } else {
      button.innerHTML = `
        Preneur (${entry.preneur_nom}): ${entry.preneur_score}<br>
        Equipier (${entry.equipier_nom}): ${entry.equipier_score}<br>
        Defense (${entry.defense_nom}): ${entry.defense_score}<br>
        Points: ${entry.points}, Contrat: ${contrat}, Bout: ${entry.bout}
      `;
    }

    if (isAuthorized) {
      button.addEventListener('click', () => {
        localStorage.setItem('selectedScore', JSON.stringify(entry));
        window.location.href = "addScore.html";
      });
    }

    container.appendChild(button);
  });
}

window.loadArchive = loadArchive;
window.addEventListener('DOMContentLoaded', loadArchive);