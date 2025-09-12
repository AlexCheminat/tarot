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
    // Fetch scores
    const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?select=*`, { headers });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const todos = await res.json();

    // Fetch groups
    const { data: groups, error } = await supabase
      .from('groups')
      .select();

    if (error) throw new Error(error.message);

    // Check for missing groups
    const groupNames = new Set(groups.map(g => g.name));
    const missing = todos.filter(score => !groupNames.has(score.name));

    if (missing.length > 0) {
      console.log("⚠️ Some scores do not have matching groups, resetting groups...");
    } else {
      console.log("✅ All scores have matching groups");
    }

    const numPlayers = todos.length;
    console.log(`Number of players: ${numPlayers}`);

    let min = 0;
    switch (numPlayers) {
      case 6:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Joueurs: ' + getNames(chosen).join(', ');
        document.getElementById('notChosen').textContent = 'Spectateur: ' + getNames(notChosen).join(', ');
        break;

      case 7:
      case 8:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Joueurs: ' + getNames(chosen).join(', ');
        document.getElementById('notChosen').textContent = 'Spectateurs: ' + getNames(notChosen).join(', ');
        break;

      case 9:
        console.log('Entered case 9');
        console.log('Groups:', groups);

        if (groups.length === 0) {
          console.log('No groups found');
          chosen = get5(todos);
          notChosen = getRest(chosen, todos);

          const { data: insertData, error: insertError } = await supabase
            .from('groups')
            .insert([{
              group1: getNames(chosen),
              group2: getNames(notChosen),
            }]);

          if (insertError) console.error("Error inserting groups:", insertError);

          // updateRounds(todos, notChosen);
          document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
          document.getElementById('notChosen').textContent = 'Table 2: ' + getNames(notChosen).join(', ');
        } else {
          console.log('Groups found');

          group = groups[0];
          resetGroups();

          console.log('Using group:', group);

          chosen = getPlayers(todos, group.group1);
          notChosen = getPlayers(todos, group.group2);

          const theChosenOne = get1(chosen);
          notChosen.push(theChosenOne);
          chosen.splice(chosen.indexOf(theChosenOne), 1);

          document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
          document.getElementById('notChosen').textContent = 'Table 2: ' + getNames(notChosen).join(', ');

          await sleep(200);
          console.log('Updating groups for next time');
          await supabase
            .from('groups')
            .insert([{
              group1: getNames(notChosen),
              group2: getNames(chosen),
            }]);
        }

        for (const name of getNames(notChosen)) {
          await supabase
            .from('scores')
            .update({ roundOf4: supabase.increment(1) })
            .eq('name', name);
        }

        min = todos[0].parties || 0;
        todos.forEach(todo => {
          if (todo.parties < min) min = todo.parties;
        });

        if (min === 8) {
          resetGroups();
        }
        console.log('Leaving case 9');
        break;

      case 10:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
        document.getElementById('notChosen').textContent = 'Table 2: ' + getNames(notChosen).join(', ');
        break;

      case 11:
        console.log('Entered case 11');
        console.log('Groups length: ' + groups.length);
        console.log('Groups:', groups);

        if (groups.length === 0) {
          console.log('No groups found, creating new group');
          chosen = get5(todos);
          notChosen = getRest(chosen, todos);
          console.log('Groups:', chosen, notChosen);

          const { data: insertData, error: insertError } = await supabase
            .from('groups')
            .insert([{
              group1: getNames(chosen),
              group2: getNames(notChosen),
            }]);

          if (insertError) console.error("Error inserting groups:", insertError);
        } else {
          groups.forEach(group => {
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

        min = todos[0].parties || 0;
        todos.forEach(todo => {
          if (todo.parties < min) min = todo.parties;
        });

        if (min === 9) {
          resetGroups();
        }
        break;

      case 12:
        console.log('Entered case 12');
        console.log('Groups:', groups);

        if (groups.length === 0) {
          console.log('No groups found, creating new group');
          chosenPlayers = get6(todos);
          console.log('Chosen players:', chosenPlayers);
          notChosenPlayers = getRest(chosenPlayers, todos);
          console.log('Rest:', notChosenPlayers);

          const { data: insertData, error: insertError } = await supabase
            .from('groups')
            .insert([{
              group1: getNames(chosenPlayers),
              group2: getNames(notChosenPlayers),
            }]);

          if (insertError) console.error("Error inserting groups:", insertError);
        } else {
          console.log('Groups found, using existing groups');
          groups.forEach(group => {
            chosenPlayers = getPlayers(todos, group.group1);
            notChosenPlayers = getPlayers(todos, group.group2);
          });
        }

        chosen1Players = get5(chosenPlayers);
        console.log('Chosen1:', chosen1Players);
        chosen2Players = get5(notChosenPlayers);
        console.log('Chosen2:', chosen2Players);
        notChosen2 = getNames(getRest2(chosen1Players, chosen2Players, todos));
        console.log('Spectators:', notChosen2);

        document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen1Players).join(', ');
        document.getElementById('chosen2').textContent = 'Table 2: ' + getNames(chosen2Players).join(', ');
        document.getElementById('notChosen').textContent = 'Spectateurs: ' + notChosen2.join(', ');

        let min = todos[0].parties || 0;
        todos.forEach(todo => {
          if (todo.parties < min) min = todo.parties;
        });

        if (min === 9) {
          resetGroups();
        }
        break;

      default:
        alert('Nombre de joueurs non supporté. Veuillez utiliser entre 6 et 12 joueurs.');
        return;
    }

    // Add luck message if not already present
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

/* ----------------------- Helper functions ----------------------- */

function get5(todos) {
  console.log('Entered get5 function');
  let min = todos[0].parties || 0;
  todos.forEach(todo => {
    if (todo.parties < min) min = todo.parties;
  });

  if (min % 5 === 4) {
    resetGroups();
  }

  let chosen = [];
  let c = todos.filter(todo => todo.parties === min).length;

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

  let chosen = [];
  let c = todos.filter(todo => todo.parties === min).length;

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
  return todos.filter(todo => !chosen.includes(todo));
}

function getRest2(chosen, chosen2, todos) {
  console.log('Entered getRest2 function');
  return todos.filter(todo => !chosen.includes(todo) && !chosen2.includes(todo));
}

function getNames(players) {
  return players.map(player => player.name);
}

function getPlayers(todos, names) {
  return todos.filter(todo => names.includes(todo.name));
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}