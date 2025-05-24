const SUPABASE_URL = "https://.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.OePJTwjh3sn42LDiHKGpXlLkIFvipHC507KaqOIEy3k";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const headers = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json"
};

const tableBody = document.querySelector('#myTable tbody');
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');

// Sync from localStorage
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
      const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?select=*`, { headers });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const todos = await res.json();
      todos.sort((a, b) => (b.score || 0) - (a.score || 0));

      const topScore = todos[0]?.score || 0;
      const secondScore = todos[1]?.score || 0;
      const crownEl = document.getElementById('crownLead');

      if (crownEl) {
        crownEl.style.display = topScore > secondScore ? 'inline' : 'none';
      }

      tableBody.innerHTML = '';

      todos.forEach(todo => {
        const isLast = todo.id === todos[todos.length - 1]?.id && todos[todos.length - 1]?.score !== todos[todos.length - 2]?.score;
        addRow(todo, todo.score || 0, isLast);
      });
    } catch (error) {
      console.error('Failed to load scores:', error);
    }
  };

  function addRow(todo, score, isLast = false) {
    const tr = document.createElement('tr');
    tr.dataset.name = todo.name;

    const imageTag = `<img src="/images/naim.png" alt="last place" style="width: 20px; vertical-align: middle; margin-left: 5px;">`;
    const nameCell = isLast ? `${todo.name} ${imageTag}` : todo.name;

    tr.innerHTML = `
      <td>${nameCell}</td>
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
        loadTodos();
      } catch (error) {
        console.error('Failed to delete score:', error);
      }
    });

    tableBody.appendChild(tr);
  }

  // Realtime Supabase listener
  supabase
    .channel('realtime:scores')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, payload => {
      console.log('Change received!', payload);
      loadTodos();
    })
    .subscribe();

  loadTodos(); // Initial load
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

window.updatePlayerScore = async function (playerName, deltaScore) {
  console.log('Updating score for:', playerName, 'by', deltaScore);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?name=eq.${encodeURIComponent(playerName)}`, { headers });

  if (!res.ok) {
    console.error("Failed to fetch player:", res.status);
    return;
  }

  const [player] = await res.json();
  if (!player) {
    console.error("Player not found:", playerName);
    return;
  }

  const updatedScore = (player.score || 0) + deltaScore;

  const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/scores?id=eq.${player.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ score: updatedScore })
  });

  if (!updateRes.ok) {
    console.error("Failed to update score:", updateRes.status);
  } else {
    console.log(`${playerName} score updated to ${updatedScore}`);
  }
};
