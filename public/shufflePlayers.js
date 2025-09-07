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
    const { data, error } = await supabase
        .from('groups')
        .select();

    const numPlayers = todos.length;
    switch (numPlayers) {
      case 6:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Joueurs: ' + getNames(chosen).join(', ');
        document.getElementById('notChosen').textContent = 'Spectateur: ' + getNames(notChosen).join(', ');
        break;
      case 7:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Joueurs: ' + getNames(chosen).join(', ');
        document.getElementById('notChosen').textContent = 'Spectateurs: ' + getNames(notChosen).join(', ');
        break;
      case 8:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Joueurs: ' + getNames(chosen).join(', ');
        document.getElementById('notChosen').textContent = 'Spectateurs: ' + getNames(notChosen).join(', ');
        break;
      case 9:
        if (data.length === 0) {
          chosen = get5(todos);
          notChosen = getRest(chosen, todos);
          const { data, error } = await supabase
          .from('groups')
          .insert([{
            group1: getNames(chosen),
            group2: getNames(notChosen),
          }]);
          updateRounds(todos, notChosen);
          document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
          document.getElementById('notChosen').textContent = 'Table 2: ' + getNames(notChosen).join(', ');
        } else {
          data.forEach(group => {
            chosen = getPlayers(todos, group.group1);
            notChosen = getPlayers(todos, group.group2);
          });
          const theChosenOne = get1(chosen);
          notChosen.push(theChosenOne);
          chosen.splice(chosen.indexOf(theChosenOne), 1);
          await supabase
          .from('groups')
          .insert([{
            group1: getNames(notChosen),
            group2: getNames(chosen),
          }]);
          document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
          document.getElementById('notChosen').textContent = 'Table 2: ' + getNames(notChosen).join(', ');
        }
        break;
      case 10:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
        document.getElementById('notChosen').textContent = 'Table 2: ' + getNames(notChosen).join(', ');
        break;
      case 11:
        console.log('Entered case 11');
        console.log('data length: ' + data.length);
        console.log('Groups:', data);
        if (data.length === 0) {
          console.log('No groups found, creating new group');
          chosen = get5(todos);
          notChosen = getRest(chosen, todos);
          console.log('Groups:', chosen, notChosen);
          const { data, error } = await supabase
          .from('groups')
          .insert([{
            group1: getNames(chosen),
            group2: getNames(notChosen),
          }]);
          console.log('Inserted groups:');
        } else {
          data.forEach(group => {
            chosen = getPlayers(todos, group.group1);
            notChosen = getPlayers(todos, group.group2);
          });
        }

        chosen2 = get5(notChosen);
        console.log('Chosen2:', chosen2);
        notChosen = getRest2(chosen, chosen2, todos);
        console.log('Not chosen:', notChosen);
        document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
        document.getElementById('chosen2').textContent = 'Table 2: ' + getNames(chosen2).join(', ');
        document.getElementById('notChosen').textContent = 'Spectateur: ' + getNames(notChosen).join(', ');
        break;
      case 12:
        console.log('Entered case 12');
        console.log('Groups:', data);
        console.log('Error:', error);
        if (error) {
          console.log('Error fetching groups:', error2);
        } else if (data.length === 0) {
          console.log('No groups found, creating new group');
          chosenPlayers = get6(todos);
          console.log('Chosen players:', chosenPlayers);
          notChosenPlayers = getRest(chosenPlayers, todos);
          console.log('rest:', notChosenPlayers);
          console.log('What im about to insert: ', getNames(chosenPlayers), getNames(notChosenPlayers));
          const insertResult = await supabase
          .from('groups')
          .insert([{
            group1: getNames(chosenPlayers),
            group2: getNames(notChosenPlayers),
          }]);
          console.log('Inserted groups');
        } else {
          console.log('Groups found, using existing groups');
          data.forEach(group => {
            chosenPlayers = getPlayers(todos, group.group1);
            notChosenPlayers = getPlayers(todos, group.group2);
          });
        }
        chosen1Players = get5(chosenPlayers);
        console.log('Chosen1:', chosen1Players);
        chosen2Players = get5(notChosenPlayers);
        console.log('Chosen2:', chosen2Players);
        notChosen2 = getNames(getRest2(chosen1Players, chosen2Players, todos));
        console.log('Two others:', notChosen2);
        console.log('Group1:', getNames(chosen1Players));
        console.log('Group2:', getNames(chosen2Players));
        console.log('Spectator:', notChosen2);
        document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen1Players).join(', ');
        document.getElementById('chosen2').textContent = 'Table 2: ' + getNames(chosen2Players).join(', ');
        document.getElementById('notChosen').textContent = 'Spectateurs: ' + notChosen2.join(', ');
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
  console.log('Entered get5 function');
  let min = todos[0].parties || 0;
  todos.forEach(todo => {
    if (todo.parties < min) min = todo.parties;
  });

  if (min % 5 === 4) {
    resetGroups();
  }

  let c = todos.filter(todo => todo.parties === min).length;

  let chosen = [];
  if (c > 4) {
    while (chosen.length < 5) {
      const rand = Math.floor(Math.random() * todos.length);
      if (!chosen.includes(todos[rand]) && todos[rand].parties === min) {
        chosen.push(todos[rand]);
      }
    }
  } else {
    todos.forEach(todo => {
      if (todo.parties === min) chosen.push(todo);
    });

    while (chosen.length < 5) {
      const rand = Math.floor(Math.random() * todos.length);
      if (!chosen.includes(todos[rand]) && todos[rand].parties === min + 1) {
        chosen.push(todos[rand]);
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

  if (min % 5 === 4) {
    resetGroups();
  }
  let c = todos.filter(todo => todo.parties === min).length;

  let chosen = [];
  if (c > 5) {
    while (chosen.length < 6) {
      const rand = Math.floor(Math.random() * todos.length);
      if (!chosen.includes(todos[rand]) && todos[rand].parties === min) {
        chosen.push(todos[rand]);
      }
    }
  } else {
    todos.forEach(todo => {
      if (todo.parties === min) chosen.push(todo);
    });

    while (chosen.length < 6) {
      const rand = Math.floor(Math.random() * todos.length);
      if (!chosen.includes(todos[rand]) && todos[rand].parties === min + 1) {
        chosen.push(todos[rand]);
      }
    }
  }

  return chosen;
}

function get1(chosen) {
  let max = chosen[0].roundOf4;
  chosen.forEach(player => {
    if (player.roundOf4 > max) max = player.roundOf4;
  });

  let rand = Math.floor(Math.random() * chosen.length);
  while (chosen[rand].roundOf4 !== max) {
    rand = Math.floor(Math.random() * chosen.length);
  }
  return chosen[rand];
}

function getRest(chosen, todos) {
  let notChosen = [];
  todos.forEach(todo => {
    if (!chosen.includes(todo)) {
      notChosen.push(todo);
    }
  });
  return notChosen;
}

function getRest2(chosen, chosen2, todos) {
  console.log('Entered getRest2 function');
  let notChosen = [];
  todos.forEach(todo => {
    console.log('Checking todo:', todo);
    if ((!chosen.includes(todo)) && (!chosen2.includes(todo))) {
      console.log('PUSHING!!!');
      notChosen.push(todo);
    }
  });
  return notChosen;
}

function getNames(players) {
  let names = [];
  players.forEach(player => {
    names.push(player.name);
  });
  return names;
}

function getPlayers(todos, names) {
  let players = [];
  todos.forEach(todo => {
    if (names.includes(todo.name)) {
      players.push(todo);
    }
  });
  return players;
}

function resetGroups() {
  supabase
  .from('groups')
  .delete()
  .eq('id', 1)
  .then(({ data, error }) => {
    if (error) {
      console.error('Error resetting groups:', error);
    } else {
      console.log('Groups reset successfully');
    }
  });
}
