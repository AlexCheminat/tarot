import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let preneur = null;
let equipier = null;
const checkboxContainer = document.getElementById('checkbox-list');
const radioContainer = document.getElementById('radio-list');
const radioContainer2 = document.getElementById('radio-list-2');

async function loadTasks() {
  const snapshot = await getDocs(collection(db, 'scores'));
  const todos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  checkboxContainer.innerHTML = '';
  radioContainer.innerHTML = '';
  radioContainer2.innerHTML = '';

  todos.forEach((todo, index) => {
    const label = document.createElement('label');
    label.className = 'task-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = todo.name;
    checkbox.id = `todo-${index}`;
    checkbox.name = 'todo';

    checkbox.addEventListener('change', () => updateRadios());

    label.setAttribute('for', checkbox.id);
    label.textContent = todo.name;

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    checkboxContainer.appendChild(document.createElement('br'));
  });
}

function updateRadios() {
  radioContainer.innerHTML = '';
  radioContainer2.innerHTML = '';

  const checkedBoxes = checkboxContainer.querySelectorAll('input[type="checkbox"]:checked');

  checkedBoxes.forEach((checkbox, index) => {
    const todoId = checkbox.value;
    const todoText = checkbox.nextSibling.textContent.trim();

    const radio1 = document.createElement('input');
    radio1.type = 'radio';
    radio1.name = 'selected-task';
    radio1.value = todoId;
    radio1.id = `radio1-${index}`;

    const label1 = document.createElement('label');
    label1.className = 'task-item';
    label1.setAttribute('for', radio1.id);
    label1.textContent = todoText;

    radioContainer.appendChild(radio1);
    radioContainer.appendChild(label1);
    radioContainer.appendChild(document.createElement('br'));

    radio1.addEventListener('click', function () {
      if (preneur === this) { this.checked = false; preneur = null; }
      else { preneur = this; }
      previewScore();
    });

    const radio2 = document.createElement('input');
    radio2.type = 'radio';
    radio2.name = 'selected-task2';
    radio2.value = todoId;
    radio2.id = `radio2-${index}`;

    const label2 = document.createElement('label');
    label2.className = 'task-item';
    label2.setAttribute('for', radio2.id);
    label2.textContent = todoText;

    radioContainer2.appendChild(radio2);
    radioContainer2.appendChild(label2);
    radioContainer2.appendChild(document.createElement('br'));

    radio2.addEventListener('click', function () {
      if (equipier === this) { this.checked = false; equipier = null; }
      else { equipier = this; }
      previewScore();
    });
  });
}

window.updateRadios = updateRadios;
loadTasks();