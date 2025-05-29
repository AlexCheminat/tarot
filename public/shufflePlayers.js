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

    const numPlayers = todos.length;
    switch (numPlayers) {
      case 6:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Joueurs: ' + chosen.join(', ');
        document.getElementById('notChosen').textContent = 'Spectateur: ' + notChosen.join(', ');
        break;
      case 7:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Joueurs: ' + chosen.join(', ');
        document.getElementById('notChosen').textContent = 'Spectateurs: ' + notChosen.join(', ');
        break;
      case 8:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Joueurs: ' + chosen.join(', ');
        document.getElementById('notChosen').textContent = 'Spectateurs: ' + notChosen.join(', ');
        break;
      case 9:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Joueurs: ' + chosen.join(', ');
        document.getElementById('notChosen').textContent = 'Spectateurs: ' + notChosen.join(', ');
        break;
      case 10:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Group 1: ' + chosen.join(', ');
        document.getElementById('notChosen').textContent = 'Group 2: ' + notChosen.join(', ');
        break;
      case 11:
        const { data, error } = await supabase
        .from('groups')
        .select();

        if (error || data.length === 0) {
          chosen = get5(todos);
          notChosen = getRest(chosen, todos);
          const { data, error } = await supabase
          .from('groups')
          .insert([{
            group1: chosen,
            group2: notChosen,
          }]);
        } else {
          data.forEach(group => {
            chosen = group.group1;
            notChosen = group.group2;
          });
        }

        chosen2 = get5(notChosen);
        notChosen = getRest2(todos, chosen, chosen2);
        document.getElementById('chosen').textContent = 'Group 1: ' + chosen.join(', ');
        document.getElementById('chosen2').textContent = 'Group 2: ' + chosen2.join(', ');
        document.getElementById('notChosen').textContent = 'Spectateur: ' + notChosen.join(', ');
        break;
      case 12:
        const { data2, error2 } = await supabase
        .from('groups')
        .select();
        if (error2) {
          console.log('Error fetching groups:', error2);
        } else if (!data2 || data2.length === 0) {
          chosen = get6(todos);
          console.log('chosen:', chosen);
          console.log('todos:', todos);
          notChosen = getRest(chosen, todos);
          const { data, error } = await supabase
            .from('groups')
            .insert([{
              group1: chosen,
              group2: notChosen,
            }]);
        } else {
          data2.forEach(group => {
            chosen = group.group1;
            notChosen = group.group2;
          });
        }
        chosen1 = get5(chosen);
        chosen2 = get5(notChosen);
        notChosen = getRest2(todos, chosen, chosen2);
        document.getElementById('chosen').textContent = 'Group 1: ' + chosen.join(', ');
        document.getElementById('chosen2').textContent = 'Group 2: ' + chosen2.join(', ');
        document.getElementById('notChosen').textContent = 'Spectateurs: ' + notChosen.join(', ');
        break;
      default:
        alert('Nombre de joueurs non supporté. Veuillez utiliser 5 ou 6 joueurs.');
        return;
    }

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

function get5(todos) {
  let min = todos[0].parties || 0;
  todos.forEach(todo => {
    if (todo.parties < min) min = todo.parties;
  });

  if (min === 6) {
    resetGroups();
  }

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

  return chosen;
}

function get6(todos) {
  let min = todos[0].parties || 0;
  todos.forEach(todo => {
    if (todo.parties < min) min = todo.parties;
  });

  if (min === 6) {
    resetGroups();
  }

  let c = todos.filter(todo => todo.parties === min).length;

  let chosen = [];
  if (c > 5) {
    while (chosen.length < 6) {
      const rand = Math.floor(Math.random() * todos.length);
      if (!chosen.includes(todos[rand].name) && todos[rand].parties === min) {
        chosen.push(todos[rand].name);
      }
    }
  } else {
    todos.forEach(todo => {
      if (todo.parties === min) chosen.push(todo.name);
    });

    while (chosen.length < 6) {
      const rand = Math.floor(Math.random() * todos.length);
      if (!chosen.includes(todos[rand].name) && todos[rand].parties === min + 1) {
        chosen.push(todos[rand].name);
      }
    }
  }

  return chosen;
}

function getRest(chosen, todos) {
  console.log('Todos inside helper:', todos);
  let notChosen = [];
  todos.forEach(todo => {
    if (!chosen.includes(todo.name)) {
      notChosen.push(todo.name);
    }
  });
  return notChosen;
}

function getRest2(chosen, chosen2, todos) {
  let notChosen = [];
  todos.forEach(todo => {
    if ((!chosen.includes(todo.name)) && (!chosen2.includes(todo.name))) {
      notChosen.push(todo.name);
    }
  });
  return notChosen;
}

function resetGroups() {
  supabase
    .from('groups')
    .delete()
    .then(({ data, error }) => {
      if (error) {
        console.error('Error resetting groups:', error);
      } else {
        console.log('Groups reset successfully');
      }
    });
}
