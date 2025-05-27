let preneur = null;
let equipier = null;
const checkboxContainer = document.getElementById('checkbox-list');
const radioContainer = document.getElementById('radio-list');
const radioContainer2 = document.getElementById('radio-list-2');

async function loadTasks() {
  const res = await fetch('https://lanbxsawcjelsngtawxw.supabase.co/rest/v1/scores', {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const todos = await res.json();

  checkboxContainer.innerHTML = '';
  radioContainer.innerHTML = '';
  radioContainer2.innerHTML = '';

    todos.forEach((todo, index) => {
    const label = document.createElement('label');
    label.className = 'task-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = todo.name;
    checkbox.id = `todo-${index}`; // unique ID
    checkbox.name = 'todo';

    checkbox.addEventListener('change', () => {
      updateRadios();
    });

    label.setAttribute('for', checkbox.id); // associate label with checkbox
    label.textContent = todo.name;

    // Add checkbox and label separately
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    checkboxContainer.appendChild(document.createElement('br'));
  });
}

function updateRadios() {
  radioContainer.innerHTML = ''; // Clear previous radios
  radioContainer2.innerHTML = '';

  const checkedBoxes = checkboxContainer.querySelectorAll('input[type="checkbox"]:checked');

  checkedBoxes.forEach((checkbox, index) => {
    const todoId = checkbox.value;
    const todoText = checkbox.nextSibling.textContent.trim();

    // First radio group
    const radio1 = document.createElement('input');
    radio1.type = 'radio';
    radio1.name = 'selected-task';
    radio1.value = todoId;
    radio1.id = `radio1-${index}`; // unique ID

    const label1 = document.createElement('label');
    label1.className = 'task-item';
    label1.setAttribute('for', radio1.id);
    label1.textContent = todoText;

    radioContainer.appendChild(radio1);
    radioContainer.appendChild(label1);
    radioContainer.appendChild(document.createElement('br'));

    radio1.addEventListener('click', function () {
      if (preneur === this) {
        this.checked = false;
        preneur = null;
      } else {
        preneur = this;
      }
      previewScore();
    });

    // Second radio group
    const radio2 = document.createElement('input');
    radio2.type = 'radio';
    radio2.name = 'selected-task2';
    radio2.value = todoId;
    radio2.id = `radio2-${index}`; // unique ID

    const label2 = document.createElement('label');
    label2.className = 'task-item';
    label2.setAttribute('for', radio2.id);
    label2.textContent = todoText;

    radioContainer2.appendChild(radio2);
    radioContainer2.appendChild(label2);
    radioContainer2.appendChild(document.createElement('br'));

    radio2.addEventListener('click', function () {
      if (equipier === this) {
        this.checked = false;
        equipier = null;
      } else {
        equipier = this;
      }
      previewScore();
    });
  });
}

function addRadio(todo) {
  const label = document.createElement('label');
  label.id = `radio-${todo.id}`;

  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'selected-task';
  radio.value = todo.id;

  label.appendChild(radio);
  label.appendChild(document.createTextNode(' ' + todo.name));
  radioContainer.appendChild(label);
  radioContainer.appendChild(document.createElement('br'));
}

function removeRadio(todoId) {
  const label = document.getElementById(`radio-${todoId}`);
  if (label) {
    label.remove();
  }
}

loadTasks();
