const SUPABASE_URL = "https://lanbxsawcjelsngtawxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbmJ4c2F3Y2plbHNuZ3Rhd3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTIzMjYsImV4cCI6MjA2MzM4ODMyNn0.OePJTwjh3sn42LDiHKGpXlLkIFvipHC507KaqOIEy3k";

const headers = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json"
};

// Select elements if they exist
const tableBody = document.querySelector('#myTable tbody');
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');

// Utility functions to get and set scores in localStorage
function getScores() {
  return JSON.parse(localStorage.getItem('playerScores') || '{}');
}

function setScores(scores) {
  localStorage.setItem('playerScores', JSON.stringify(scores));
}

// Listen for localStorage changes to update scores cross-tab
window.addEventListener('storage', (event) => {
  if (event.key === 'playerScores' && tableBody) {
    const scores = JSON.parse(event.newValue || '{}');
    document.querySelectorAll('#myTable tbody tr').forEach(row => {
      const playerName = row.dataset.name;
      const scoreCell = row.querySelector('.score-cell');
      if (playerName && scoreCell && scores[playerName] !== undefined) {
        scoreCell.textContent = scores[playerName];
      }
    });
  }
});

let loadTodos; // Declare here to use across functions

if (tableBody) {
  // Load player list from server and render the leaderboard
  loadTodos = async () => {
  try {
    const res = await fetch('/api/todos');
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const todos = await res.json();
    const scores = getScores();

    // Sort todos by score in descending order
    todos.sort((a, b) => (scores[b.text] || 0) - (scores[a.text] || 0));

    const topScore = scores[todos[0]?.text] || 0;
    const secondScore = scores[todos[1]?.text] || 0;
    const crownEl = document.getElementById('crownLead');

    if (crownEl) {
      if (topScore > secondScore) {
        crownEl.style.display = 'inline'; // or 'block', depending on layout
      } else {
        crownEl.style.display = 'none';
      }
    }

    tableBody.innerHTML = '';
    todos.forEach(todo => {
      addRow(todo, scores[todo.text] || 0);
    });
  } catch (error) {
    console.error('Failed to load todos:', error);
  }
};

  // Create and append a row for a player
  function addRow(todo, score) {
    const tr = document.createElement('tr');
    tr.dataset.name = todo.text;

    tr.innerHTML = `
      <td>${todo.text}</td>
      <td class="score-cell">${score}</td>
      <td><button class="delete-btn">Supprimer</button></td>
    `;

    tr.querySelector('.delete-btn').addEventListener('click', async () => {
      try {
        const res = await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        const scores = getScores();
        delete scores[todo.text];
        setScores(scores);
        loadTodos();
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    });

    tableBody.appendChild(tr);
  }

  // Initial load of the leaderboard
  loadTodos();
}

// Handle new player submissions via the form
if (form && input) {
  form.onsubmit = async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error(`Add failed: ${res.status}`);
      input.value = '';
      if (typeof loadTodos === 'function') loadTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };
}

// Global function to update player scores externally
window.updatePlayerScore = function (playerName, deltaScore) {
  console.log('Updating score for:', playerName, 'by', deltaScore);

  const scores = getScores();
  scores[playerName] = (scores[playerName] || 0) + deltaScore;
  setScores(scores);

  if (tableBody) {
    const row = document.querySelector(`tr[data-name="${playerName}"]`);
    if (typeof loadTodos === 'function') {
      loadTodos();
    }
  }
};
