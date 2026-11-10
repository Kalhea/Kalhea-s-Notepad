const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, 'notepad.db');

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            }
        });
    }
});

module.exports = db;