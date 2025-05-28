const SUPABASE_URL = "https://lanbxsawcjelsngtawxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbmJ4c2F3Y2plbHNuZ3Rhd3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTIzMjYsImV4cCI6MjA2MzM4ODMyNn0.OePJTwjh3sn42LDiHKGpXlLkIFvipHC507KaqOIEy3k";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const headers = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json"
};

document.getElementById('shuffleBtn').addEventListener('click', async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?select=*`, { headers });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const todos = await res.json();

    let min = todos[0].parties || 0;
    todos.forEach(todo => {
      if (todo.parties < min) min = todo.parties;
    });

    let c = todos.filter(todo => todo.parties === min).length;

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
        if (todo.parties === min) chosen.push(todo.name);
      });

      while (chosen.length < 5) {
        const rand = Math.floor(Math.random() * todos.length);
        if (!chosen.includes(todos[rand].name) && todos[rand].parties === min + 1) {
          chosen.push(todos[rand].name);
        }
      }
    }
    // Others
    const notChosen = todos.filter(player => !chosen.includes(player.name));

    // Display the chosen names
    document.getElementById('chosen').textContent = chosen.join(', ');
    document.getElementById('chosen').textContent = notChosen.name.join('; ');

    if (!document.getElementById('luckMsg')) {
        const msg = document.createElement('p');
        msg.id = 'luckMsg';
        msg.textContent = "Bonne Chance !!!";
        document.body.appendChild(msg);
    }
  } catch (error) {
    console.error('Failed to load scores:', error);
  }
});
