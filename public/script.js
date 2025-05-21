const SUPABASE_URL = "https://lanbxsawcjelsngtawxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbmJ4c2F3Y2plbHNuZ3Rhd3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTIzMjYsImV4cCI6MjA2MzM4ODMyNn0.OePJTwjh3sn42LDiHKGpXlLkIFvipHC507KaqOIEy3k";

const headers = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json"
};

const tableBody = document.querySelector('#myTable tbody');
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');

function getScores() {
  return JSON.parse(localStorage.getItem('playerScores') || '{}');
}

function setScores(scores) {
  localStorage.setItem('playerScores', JSON.stringify(scores));
}

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

let loadTodos;

if (tableBody) {
  loadTodos = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?select=*`, {
        headers
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const todos = await res.json();
      const scores = getScores();

      todos.sort((a, b) => (scores[b.name] || 0) - (scores[a.name] || 0));

      const topScore = scores[todos[0]?.name] || 0;
      const secondScore = scores[todos[1]?.name] || 0;
      const crownEl = document.getElementById('crownLead');

      if (crownEl) {
        crownEl.style.display = topScore > secondScore ? 'inline' : 'none';
      }

      tableBody.innerHTML = '';
      todos.forEach(todo => {
        addRow(todo, scores[todo.name] || 0);
      });
    } catch (error) {
      console.error('Failed to load scores:', error);
    }
  };

  function addRow(todo, score) {
    const tr = document.createElement('tr');
    tr.dataset.name = todo.name;

    tr.innerHTML = `
      <td>${todo.name}</td>
      <td class="score-cell">${score}</td>
      <td><button class="delete-btn">Supprimer</button></td>
    `;

    tr.querySelector('.delete-btn').addEventListener('click', async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?id=eq.${todo.id}`, {
          method: 'DELETE',
          headers
        });
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        const scores = getScores();
        delete scores[todo.name];
        setScores(scores);
        loadTodos();
      } catch (error) {
        console.error('Failed to delete score:', error);
      }
    });

    tableBody.appendChild(tr);
  }

  loadTodos();
}

if (form && input) {
  form.onsubmit = async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: text })
      });
      if (!res.ok) throw new Error(`Add failed: ${res.status}`);
      input.value = '';
      if (typeof loadTodos === 'function') loadTodos();
    } catch (error) {
      console.error('Failed to add score:', error);
    }
  };
}

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
