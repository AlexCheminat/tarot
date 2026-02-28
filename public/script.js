import { db } from './firebase.js';
import {
  collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const tableBody = document.querySelector('#myTable tbody');
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');

let loadTodos;

if (tableBody) {
  loadTodos = async () => {
    try {
      const q = query(collection(db, 'scores'), orderBy('score', 'desc'));
      const snapshot = await getDocs(q);
      const todos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      const topScore = todos[0]?.score || 0;
      const secondScore = todos[1]?.score || 0;
      const crownEl = document.getElementById('crownLead');

      if (crownEl) {
        crownEl.style.display = topScore > secondScore ? 'inline' : 'none';
      }

      tableBody.innerHTML = '';

      const alone = todos.length >= 2 && todos[todos.length - 1]?.score < todos[todos.length - 2]?.score;

      todos.forEach(todo => {
        const isLast = todo.id === todos[todos.length - 1]?.id && alone;
        addRow(todo, todo.score || 0, todo.parties || 0, isLast);
      });
    } catch (error) {
      console.error('Failed to load scores:', error);
    }
  };

  function addRow(todo, score, parties, isLast = false) {
    const tr = document.createElement('tr');
    tr.dataset.name = todo.name;

    const imageTag = `<img src="/images/naim.png" alt="last place" style="width: 40px; vertical-align: middle; margin-left: 5px;">`;
    const nameCell = isLast ? `${todo.name} ${imageTag}` : todo.name;

    tr.innerHTML = `
      <td>${nameCell}</td>
      <td class="score-cell">${score}</td>
      <td>${parties}</td>
      <td><button class="delete-btn">Supprimer</button></td>
    `;

    tr.querySelector('.delete-btn').addEventListener('click', async () => {
      try {
        await deleteDoc(doc(db, 'scores', todo.id));
        loadTodos();
      } catch (error) {
        console.error('Failed to delete score:', error);
      }
    });

    tableBody.appendChild(tr);
  }

  // Realtime listener
  const q = query(collection(db, 'scores'), orderBy('score', 'desc'));
  onSnapshot(q, () => {
    loadTodos();
  });

  loadTodos();
}

if (form && input) {
  form.onsubmit = async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    try {
      await addDoc(collection(db, 'scores'), { name: text, score: 0, parties: 0, roundOf4: 0 });
      input.value = '';
      if (typeof loadTodos === 'function') loadTodos();
    } catch (error) {
      console.error('Failed to add score:', error);
    }
  };
}

window.updatePlayerScore = async function (playerName, deltaScore, modified) {
  console.log('Updating score for:', playerName, 'by', deltaScore);

  const snapshot = await getDocs(collection(db, 'scores'));
  const playerDoc = snapshot.docs.find(d => d.data().name === playerName);

  if (!playerDoc) {
    console.error("Player not found:", playerName);
    return;
  }

  const player = playerDoc.data();
  const updatedScore = (player.score || 0) + deltaScore;
  const updatedParties = modified ? (player.parties || 0) - 1 : (player.parties || 0) + 1;

  try {
    await updateDoc(doc(db, 'scores', playerDoc.id), { score: updatedScore, parties: updatedParties });
    console.log(`${playerName} score updated to ${updatedScore}`);
  } catch (error) {
    console.error("Failed to update score:", error);
  }
};