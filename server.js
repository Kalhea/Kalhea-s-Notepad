const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/notes', (req, res) => {
    const sql = 'SELECT * FROM notes ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ notes: rows });
    });
});

app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    const sql = 'INSERT INTO notes (title, content) VALUES (?, ?)';
    db.run(sql, [title, content], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'Note created successfully',
            id: this.lastID,
            note: { id: this.lastID, title, content }
        });
    });
});

app.put('/api/notes/:id', (req, res) => {
    const { title, content } = req.body;
    const { id } = req.params;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    const sql = 'UPDATE notes SET title = ?, content = ? WHERE id = ?';
    db.run(sql, [title, content, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Note updated successfully', changes: this.changes });
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM notes WHERE id = ?';
    db.run(sql, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Note deleted successfully', changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running smoothly on http://localhost:${PORT}`);
});