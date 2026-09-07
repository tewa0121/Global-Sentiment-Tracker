const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root', // Replace with your MySQL user
  password: 'your_password', // Replace with your MySQL password
  database: 'sentiment_db'
});

// Helper for sentiment calculation
function analyzeText(text) {
  const lower = text.toLowerCase();
  let score = 0;
  
  const positiveWords = ['great', 'awesome', 'love', 'fantastic', 'breeze', 'fast', 'progress', 'world class', 'incredible', 'excellent'];
  const negativeWords = ['crash', 'bad', 'sluggish', 'unacceptable', 'frustrating', 'drop', 'concerning', 'terrible', 'fail', 'slow'];

  positiveWords.forEach(word => {
    if (lower.includes(word)) score += 3;
  });

  negativeWords.forEach(word => {
    if (lower.includes(word)) score -= 2;
  });

  let label = 'neutral';
  if (score > 0) label = 'positive';
  if (score < 0) label = 'negative';

  return { score, label };
}

// GET Endpoint: Fetch all posts
app.get('/api/posts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// POST Endpoint: Save user-submitted post
app.post('/api/posts', async (req, res) => {
  const { text, keyword } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Text content is required' });
  }

  const { score, label } = analyzeText(text);

  // Generate random coordinates for geospatial mapping
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

    res.json({
      success: true,
      id: result.insertId,
      message: 'Post analyzed and saved successfully'
    });
  } catch (err) {
    console.error('Error inserting post:', err);
    res.status(500).json({ error: 'Failed to insert post into database' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});