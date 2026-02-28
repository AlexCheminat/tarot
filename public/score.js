import { db } from './firebase.js';
import {
  collection, addDoc, doc, updateDoc, getDocs, query, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let contrat = null;
let primeCheck1 = null;
let primeCheck2 = null;
let primeCheck3 = null;

document.querySelectorAll('input[type="radio"][name="selected-task"]').forEach(radio => {
  radio.addEventListener('click', function () {
    if (preneur === this) { this.checked = false; preneur = null; }
    else { preneur = this; }
  });
});

document.querySelectorAll('input[type="radio"][name="selected-task2"]').forEach(radio => {
  radio.addEventListener('click', function () {
    if (equipier === this) { this.checked = false; equipier = null; }
    else { equipier = this; }
  });
});

document.querySelectorAll('input[type="radio"][name="contrat"]').forEach(radio => {
  radio.addEventListener('click', function () {
    if (contrat === this) { this.checked = false; contrat = null; }
    else { contrat = this; }
  });
});

['prime1','prime2','prime3'].forEach((name, i) => {
  let ref = [primeCheck1, primeCheck2, primeCheck3];
  document.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach(radio => {
    radio.addEventListener('click', function () {
      if (ref[i] === this) { this.checked = false; ref[i] = null; }
      else { ref[i] = this; }
    });
  });
});

function getFormData() {
  const selectedPlayers = Array.from(document.querySelectorAll('#checkbox-list input[type="checkbox"]:checked')).map(cb => cb.value);
  const preneur = document.querySelector('#radio-list input[type="radio"]:checked')?.value || null;
  const equipier = document.querySelector('#radio-list-2 input[type="radio"]:checked')?.value || null;
  const points = parseFloat(document.querySelector('#points')?.value) || 0;
  const contrat = document.querySelector('input[name="contrat"]:checked')?.value || null;
  const bout = parseInt(document.querySelector('#bout')?.value) || 0;
  const primes = Array.from(document.querySelectorAll('input[name^="prime"]:checked')).map(cb => cb.value);
  return { players: selectedPlayers, preneur, equipier, points, contrat, bout, primes };
}

function submitForm() {
  const formData = getFormData();
  calculateScore(formData, true);
}

function previewScore() {
  const formData = getFormData();
  calculateScore(formData, false);
}

function calculateScore(formData, isFinalSubmit) {
  let score = 0;
  switch (formData.bout) {
    case 0: score = formData.points - 56; break;
    case 1: score = formData.points - 51; break;
    case 2: score = formData.points - 41; break;
    case 3: score = formData.points - 36; break;
  }

  let winFlag = score >= 0;
  if (!winFlag) score = -score;
  score += 25;

  if (formData.primes.includes("1")) score += winFlag ? 10 : -10;
  else if (formData.primes.includes("2")) score += winFlag ? -10 : 10;

  switch (formData.contrat) {
    case "2": score *= 2; break;
    case "3": score *= 4; break;
    case "4": score *= 6; break;
  }

  if (formData.primes.includes("3")) score += 20;
  if (formData.primes.includes("4")) score += 40;
  if (formData.primes.includes("5")) score += 30;
  if (formData.primes.includes("6")) score += 40;

  if (winFlag) {
    if (formData.primes.includes("7")) score += 400;
    else if (formData.primes.includes("8")) score += 200;
    else if (formData.primes.includes("9")) score -= 200;
  } else {
    if (formData.primes.includes("7")) score -= 400;
    else if (formData.primes.includes("8")) score -= 200;
    else if (formData.primes.includes("9")) score += 200;
  }

  let defPlayer = 0, attPlayer = 0, equipierScore = 0;

  if (winFlag) {
    defPlayer = -score;
    if (formData.preneur === formData.equipier) attPlayer = score * 4;
    else if (formData.equipier === null) attPlayer = score * 3;
    else { attPlayer = score * 2; equipierScore = score; }
  } else {
    defPlayer = score;
    if (formData.preneur === formData.equipier) attPlayer = -score * 4;
    else if (formData.equipier === null) attPlayer = -score * 3;
    else { attPlayer = -score * 2; equipierScore = -score; }
  }

  display(attPlayer, equipierScore, defPlayer);

  if (isFinalSubmit) {
    const allDefenders = formData.players.filter(name => name !== formData.preneur && name !== formData.equipier);
    window.updatePlayerScore(formData.preneur, attPlayer, false);
    if (formData.preneur !== formData.equipier) {
      window.updatePlayerScore(formData.equipier, equipierScore, false);
    }
    allDefenders.forEach(name => window.updatePlayerScore(name, defPlayer, false));
    archiveScore(formData, attPlayer, equipierScore, defPlayer);
  }
}

async function archiveScore(formData, attPlayer, equipierScore, defPlayer) {
  const allDefenders = formData.players.filter(name => name !== formData.preneur && name !== formData.equipier);
  const archiveId = localStorage.getItem('archiveId');

  if (archiveId && archiveId !== "undefined" && archiveId !== "null") {
    await updateDoc(doc(db, 'score_archive', archiveId), {
      preneur_nom: formData.preneur,
      preneur_score: attPlayer,
      equipier_nom: formData.equipier,
      equipier_score: equipierScore,
      defense_nom: allDefenders,
      defense_score: defPlayer,
      points: formData.points,
      contrat: formData.contrat,
      bout: formData.bout,
      primes: formData.primes,
    });
    removePrevScores();
    localStorage.removeItem('archiveId');
  } else {
    await addDoc(collection(db, 'score_archive'), {
      preneur_nom: formData.preneur,
      preneur_score: attPlayer,
      equipier_nom: formData.equipier,
      equipier_score: equipierScore,
      defense_nom: allDefenders,
      defense_score: defPlayer,
      points: formData.points,
      contrat: formData.contrat,
      bout: formData.bout,
      primes: formData.primes,
      time_created: new Date().toISOString(),
    });
  }

  localStorage.removeItem('selectedScore');
}

function display(attPlayer, equipier, defPlayer) {
  if (window.location.pathname.includes("addScore.html")) {
    const preneurSpan = document.querySelector('#preneur');
    const equipierSpan = document.querySelector('#equipier');
    const defenseSpan = document.querySelector('#defense');
    const equipierLine = document.querySelector('#equipier-line');

    if (preneurSpan && equipierSpan && defenseSpan && equipierLine) {
      preneurSpan.textContent = attPlayer;
      defenseSpan.textContent = defPlayer;
      if (equipier === 0) {
        equipierLine.style.display = 'none';
      } else {
        equipierLine.style.display = 'block';
        equipierSpan.textContent = equipier;
      }
    }
  }
}

function removePrevScores() {
  const rawData = localStorage.getItem('selectedScore');
  const entry = JSON.parse(rawData);
  console.log(entry);
  window.updatePlayerScore(entry.preneur_nom, -entry.preneur_score, true);
  if (entry.preneur_nom !== entry.equipier_nom) {
    window.updatePlayerScore(entry.equipier_nom, -entry.equipier_score, true);
  }
  entry.defense_nom.forEach(name => window.updatePlayerScore(name, -entry.defense_score, true));
}

function setupAutoUpdate() {
  const inputs = document.querySelectorAll('input[name="todo"], input[name="selected-task"], input[name="selected-task2"], input[name="contrat"], input[name^="prime"], #points, #bout');
  inputs.forEach(input => {
    input.addEventListener('input', previewScore);
    input.addEventListener('change', previewScore);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes("addScore.html")) {
    setupAutoUpdate();
    previewScore();
  }
});

window.submitForm = submitForm;