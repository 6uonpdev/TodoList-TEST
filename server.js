const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_FOR_PRODUCTION';

app.use(cors());
app.use(express.json());

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });

  db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) return res.status(400).json({ error: 'Email đã tồn tại' });

    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users(email, password) VALUES(?, ?)', [email, hash], function (err) {
      if (err) return res.status(500).json({ error: 'Database insert error' });
      return res.json({ success: true });
    });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });

  db.get('SELECT email, password FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(400).json({ error: 'Không tìm thấy tài khoản' });

    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(400).json({ error: 'Sai mật khẩu' });

    const token = jwt.sign({ email: row.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email: row.email });
  });
});

// Get tasks
app.get('/api/tasks', authenticate, (req, res) => {
  const email = req.user.email;
  db.all('SELECT id, title, deadline, completed FROM tasks WHERE user_email = ? ORDER BY id DESC', [email], (err, rows) => {
    // map completed from 0/1 to boolean
    const tasks = rows.map(r => ({ id: r.id, title: r.title, deadline: r.deadline, completed: !!r.completed }));
    res.json({ tasks });
  });
});

// Create task
app.post('/api/tasks', authenticate, (req, res) => {
  const email = req.user.email;
  const { title, deadline } = req.body;
  db.run('INSERT INTO tasks(user_email, title, deadline, completed) VALUES(?, ?, ?, 0)', [email, title, deadline || null], function (err) {
    res.json({ id: this.lastID });
  });
});

// Update task
app.put('/api/tasks/:id', authenticate, (req, res) => {
  const email = req.user.email;
  const id = req.params.id;
  const { title, deadline, completed } = req.body;

  // Ensure task belongs to user
  db.get('SELECT id FROM tasks WHERE id = ? AND user_email = ?', [id, email], (err, row) => {
    db.run('UPDATE tasks SET title = ?, deadline = ?, completed = ? WHERE id = ?', [title, deadline || null, completed ? 1 : 0, id], function (err) {
      res.json({ success: true });
    });
  });
});

// Delete task
app.delete('/api/tasks/:id', authenticate, (req, res) => {
  const email = req.user.email;
  const id = req.params.id;
  db.run('DELETE FROM tasks WHERE id = ? AND user_email = ?', [id, email], function (err) {
    res.json({ success: true });
  });
});

// Mock NLP parsing endpoint (demo)
app.post('/api/nlp', authenticate, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  // Very simple mock: return the full text as title and a deadline 24h from now
  const title = text.length > 120 ? text.slice(0, 120) + '...' : text;
  const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  res.json({ title, deadline });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
