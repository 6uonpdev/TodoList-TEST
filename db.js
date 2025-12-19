const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'data.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Failed to open DB', err);
  console.log('Opened SQLite DB at', dbPath);
});

// Initialize schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      title TEXT NOT NULL,
      deadline TEXT,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY(user_email) REFERENCES users(email)
    )
  `);
});

module.exports = db;
