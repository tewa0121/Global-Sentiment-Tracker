const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Pool Configuration
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'sentiment_db'
});

// Basic sentiment analysis engine
function analyzeText(text) {
  const lower = text.toLowerCase();
  let score = 0;
  
  const positiveWords = ['great', 'awesome', 'love', 'fantastic', 'fast', 'progress', 'incredible', 'excellent', 'happy', 'good'];
  const negativeWords = ['crash', 'bad', 'sluggish', 'unacceptable', 'frustrating', 'drop', 'terrible', 'fail', 'slow', 'broken'];

  positiveWords.forEach(w => { if (lower.includes(w)) score += 3; });
  negativeWords.forEach(w => { if (lower.includes(w)) score -= 2; });

  let label = 'neutral';
  if (score > 0) label = 'positive';
  if (score < 0) label = 'negative';

  return { score, label };
}

// GET Endpoint: Return all posts
app.get('/api/posts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});

// POST Endpoint: Save analyzed post
app.post('/api/posts', async (req, res) => {
  const { text, keyword } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text content is required' });
  }

  const { score, label } = analyzeText(text);

  // Random coordinates for global map view
  const latitude = (Math.random() * 140 - 70).toFixed(4);
  const longitude = (Math.random() * 360 - 180).toFixed(4);

  const query = `
    INSERT INTO posts (post_text, keyword, sentiment_score, sentiment_label, latitude, longitude, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  try {
    const [result] = await db.execute(query, [
      text,
      keyword || 'General',
      score,
      label,
      latitude,
      longitude
    ]);

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Insert Error:', err);
    res.status(500).json({ error: 'Failed to save post' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server listening at http://localhost:${PORT}`);
});