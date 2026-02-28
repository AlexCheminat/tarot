import { db } from './firebase.js';
import {
  collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";



document.getElementById('shuffleBtn').addEventListener('click', async () => {
  try {
    const scoresSnap = await getDocs(query(collection(db, 'scores'), orderBy('parties', 'asc')));
    const todos = scoresSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const groupsSnap = await getDocs(collection(db, 'groups'));
    const groups = groupsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let chosen, notChosen, chosen2, chosenPlayers, notChosenPlayers, chosen1Players, chosen2Players, notChosen2;

    const numPlayers = todos.length;
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
        if (groups.length === 0) {
          chosen = get5(todos);
          notChosen = getRest(chosen, todos);
          await addDoc(collection(db, 'groups'), { group1: getNames(chosen), group2: getNames(notChosen) });
          document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
          document.getElementById('notChosen').textContent = 'Table 2: ' + getNames(notChosen).join(', ');
        } else {
          const group = groups[0];
          await resetGroups(groups);

          chosen = getPlayers(todos, group.group1);
          notChosen = getPlayers(todos, group.group2);

          const theChosenOne = get1(chosen);
          notChosen.push(theChosenOne);
          chosen.splice(chosen.indexOf(theChosenOne), 1);

          document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
          document.getElementById('notChosen').textContent = 'Table 2: ' + getNames(notChosen).join(', ');

          await sleep(200);
          await addDoc(collection(db, 'groups'), { group1: getNames(notChosen), group2: getNames(chosen) });
        }

        for (const name of getNames(chosen)) {
          const playerDoc = scoresSnap.docs.find(d => d.data().name === name);
          if (playerDoc) {
            const current = playerDoc.data().roundOf4 || 0;
            await updateDoc(doc(db, 'scores', playerDoc.id), { roundOf4: current + 1 });
          }
        }

        min = todos[0].parties || 0;
        todos.forEach(todo => { if (todo.parties < min) min = todo.parties; });
        if (min === 8) await resetGroups(groups);
        break;

      case 10:
        chosen = get5(todos);
        notChosen = getRest(chosen, todos);
        document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
        document.getElementById('notChosen').textContent = 'Table 2: ' + getNames(notChosen).join(', ');
        break;

      case 11:
        if (groups.length === 0) {
          chosen = get5(todos);
          notChosen = getRest(chosen, todos);
          await addDoc(collection(db, 'groups'), { group1: getNames(chosen), group2: getNames(notChosen) });
        } else {
          groups.forEach(group => {
            chosen = getPlayers(todos, group.group1);
            notChosen = getPlayers(todos, group.group2);
          });
        }
        chosen2 = get5(notChosen);
        notChosen = getRest2(chosen, chosen2, todos);
        document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen).join(', ');
        document.getElementById('chosen2').textContent = 'Table 2: ' + getNames(chosen2).join(', ');
        document.getElementById('notChosen').textContent = 'Spectateur: ' + getNames(notChosen).join(', ');

        min = todos[0].parties || 0;
        todos.forEach(todo => { if (todo.parties < min) min = todo.parties; });
        if (min === 9) await resetGroups(groups);
        break;

      case 12:
        if (groups.length === 0) {
          chosenPlayers = get6(todos);
          notChosenPlayers = getRest(chosenPlayers, todos);
          await addDoc(collection(db, 'groups'), { group1: getNames(chosenPlayers), group2: getNames(notChosenPlayers) });
        } else {
          groups.forEach(group => {
            chosenPlayers = getPlayers(todos, group.group1);
            notChosenPlayers = getPlayers(todos, group.group2);
          });
        }
        chosen1Players = get5(chosenPlayers);
        chosen2Players = get5(notChosenPlayers);
        notChosen2 = getNames(getRest2(chosen1Players, chosen2Players, todos));
        document.getElementById('chosen').textContent = 'Table 1: ' + getNames(chosen1Players).join(', ');
        document.getElementById('chosen2').textContent = 'Table 2: ' + getNames(chosen2Players).join(', ');
        document.getElementById('notChosen').textContent = 'Spectateurs: ' + notChosen2.join(', ');

        min = todos[0].parties || 0;
        todos.forEach(todo => { if (todo.parties < min) min = todo.parties; });
        if (min === 9) await resetGroups(groups);
        break;

      default:
        alert('Nombre de joueurs non supporté. Veuillez utiliser entre 6 et 12 joueurs.');
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

/* ----------------------- Helper functions ----------------------- */

function get5(todos) {
  let min = todos[0].parties || 0;
  todos.forEach(todo => { if (todo.parties < min) min = todo.parties; });

  let chosen = [];
  let c = todos.filter(todo => todo.parties === min).length;

  if (c > 4) {
    while (chosen.length < 5) {
      const rand = Math.floor(Math.random() * todos.length);
      if (!chosen.includes(todos[rand]) && todos[rand].parties === min) chosen.push(todos[rand]);
    }
  } else {
    todos.forEach(todo => { if (todo.parties === min) chosen.push(todo); });
    while (chosen.length < 5) {
      const rand = Math.floor(Math.random() * todos.length);
      if (!chosen.includes(todos[rand]) && todos[rand].parties === min + 1) chosen.push(todos[rand]);
    }
  }
  return chosen;
}

function get6(todos) {
  let min = todos[0].parties || 0;
  todos.forEach(todo => { if (todo.parties < min) min = todo.parties; });

  let chosen = [];
  let c = todos.filter(todo => todo.parties === min).length;

  if (c > 5) {
    while (chosen.length < 6) {
      const rand = Math.floor(Math.random() * todos.length);
      if (!chosen.includes(todos[rand]) && todos[rand].parties === min) chosen.push(todos[rand]);
    }
  } else {
    todos.forEach(todo => { if (todo.parties === min) chosen.push(todo); });
    while (chosen.length < 6) {
      const rand = Math.floor(Math.random() * todos.length);
      if (!chosen.includes(todos[rand]) && todos[rand].parties === min + 1) chosen.push(todos[rand]);
    }
  }
  return chosen;
}

function get1(chosen) {
  let min = chosen[0].roundOf4;
  chosen.forEach(player => { if (player.roundOf4 < min) min = player.roundOf4; });
  let rand = Math.floor(Math.random() * chosen.length);
  while (chosen[rand].roundOf4 !== min) rand = Math.floor(Math.random() * chosen.length);
  return chosen[rand];
}

function getRest(chosen, todos) { return todos.filter(todo => !chosen.includes(todo)); }
function getRest2(chosen, chosen2, todos) { return todos.filter(todo => !chosen.includes(todo) && !chosen2.includes(todo)); }
function getNames(players) { return players.map(player => player.name); }
function getPlayers(todos, names) { return todos.filter(todo => names.includes(todo.name)); }

async function resetGroups(groups) {
  const deletePromises = groups.map(g => deleteDoc(doc(db, 'groups', g.id)));
  await Promise.all(deletePromises);
  console.log('Groups reset successfully');
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }