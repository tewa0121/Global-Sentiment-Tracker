const express = require('express');
const cors = require('cors');
const { initDB, getPool } = require('./config/db');
const analyzeText = require('./utils/sentiment');

const app = express();
app.use(cors());
app.use(express.json());

// GET: Fetch recent posts with keywords
app.get('/api/posts', async (req, res) => {
  try {
    const db = getPool();
    const [rows] = await db.query(`
      SELECT p.id, p.post_text, p.sentiment_score, p.sentiment_label, k.term AS keyword, p.created_at 
      FROM posts p 
      JOIN keywords k ON p.keyword_id = k.id 
      ORDER BY p.created_at DESC 
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Add new post, analyze sentiment, store in DB
app.post('/api/posts', async (req, res) => {
  const { text, keyword } = req.body;
  if (!text || !keyword) {
    return res.status(400).json({ error: 'Text and keyword are required.' });
  }

  const analysis = analyzeText(text);

  try {
    const db = getPool();

    // Check if keyword exists, insert if missing
    let [keywords] = await db.query('SELECT id FROM keywords WHERE term = ?', [keyword]);
    let keywordId = keywords[0]?.id;

    if (!keywordId) {
      const [insertResult] = await db.query('INSERT INTO keywords (term) VALUES (?)', [keyword]);
      keywordId = insertResult.insertId;
    }

    // Insert post record
    const [postResult] = await db.query(
      'INSERT INTO posts (keyword_id, post_text, sentiment_score, sentiment_label) VALUES (?, ?, ?, ?)',
      [keywordId, text, analysis.score, analysis.label]
    );

    res.status(201).json({
      id: postResult.insertId,
      keyword,
      post_text: text,
      sentiment_score: analysis.score,
      sentiment_label: analysis.label
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize Database then Start Server
const PORT = 5000;
initDB().then(() => {
  app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`));
});