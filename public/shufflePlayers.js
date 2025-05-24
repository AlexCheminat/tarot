const SUPABASE_URL = "https://lanbxsawcjelsngtawxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbmJ4c2F3Y2plbHNuZ3Rhd3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTIzMjYsImV4cCI6MjA2MzM4ODMyNn0.OePJTwjh3sn42LDiHKGpXlLkIFvipHC507KaqOIEy3k";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const headers = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json"
};

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

window.addEventListener('shuffleBtn', (event) => {
    let loadTodos;

    loadTodos = async () => {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?select=*`, { headers });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const todos = await res.json();

        let min = todos[0].parties || 0;
        todos.forEach(todo => {
            if (todo.parties < min) {
                min = todo.parties;
            }
        });

        let c = 0;
        todos.forEach(todo => {
            if (todo.parties === min) {
                c++;
            }
        });

        let chosen = [];
        if (c > 4) {
            while (chosen.length < 5) {
                const rand = Math.floor(Math.random() * todos.length);
                if (!chosen.includes(todos[rand].name) && todos[rand].parties === min) {
                    chosen.push(todos[rand].name);
                }
            }
        } else {
            todos.forEach(todo => {
                if (todo.parties === min) {
                    chosen.push(todo.name);
                }
            });

            while (chosen.length < 5) {
                const rand = Math.floor(Math.random() * todos.length);
                if (!chosen.includes(todos[rand].name) && todos[rand].parties === min + 1) {
                    chosen.push(todos[rand].name);
                }
            }
        }

        document.querySelector('#chosen').textContent = chosen[0];
    } catch (error) {
        console.error('Failed to load scores:', error);
    }
    };
});
