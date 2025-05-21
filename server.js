// server.js
const express = require('express');
const app = express();
const PORT = 3000;

let todos = [];

app.use(express.static('public')); // Serve frontend
app.use(express.json()); // Parse JSON body

// Routes
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const todo = { id: Date.now(), text: req.body.text };
  todos.push(todo);
  res.status(201).json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  todos = todos.filter(todo => todo.id !== Number(req.params.id));
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
