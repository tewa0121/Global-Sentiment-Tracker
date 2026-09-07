const express = require('express');
const cors = require('cors');
const { initDB, getPool } = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sentiment Analyzer
function analyzeText(inputText) {
  if (!inputText || typeof inputText !== 'string') {
    return { score: 0, label: 'neutral' };
  }

  const lower = inputText.toLowerCase();
  let score = 0;

  const positiveWords = ['great', 'awesome', 'love', 'fantastic', 'fast', 'good', 'happy', 'excellent', 'amazing', 'incredible', 'wonderful', 'like', 'best'];
  const negativeWords = ['crash', 'bad', 'sluggish', 'terrible', 'fail', 'slow', 'broken', 'horrible', 'disappointed', 'issues', 'issue', 'worst', 'bug', 'unusable'];

  positiveWords.forEach((word) => {
    if (lower.includes(word)) score += 3;
  });

  negativeWords.forEach((word) => {
    if (lower.includes(word)) score -= 2;
  });

  let label = 'neutral';
  if (score > 0) label = 'positive';
  if (score < 0) label = 'negative';

  return { score, label };
}

// GET Route: Fetch posts
app.get('/api/posts', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        p.id, 
        k.term AS keyword, 
        p.post_text, 
        p.sentiment_score, 
        p.sentiment_label, 
        p.latitude, 
        p.longitude, 
        p.created_at 
      FROM posts p 
      JOIN keywords k ON p.keyword_id = k.id 
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// POST Route: Save posts
app.post('/api/posts', async (req, res) => {
  // Catch any potential property name variation
  const textContent = req.body?.post_text || req.body?.text || req.body?.content || req.body?.message;
  const keywordTerm = req.body?.keyword;

  if (!textContent || typeof textContent !== 'string' || !textContent.trim()) {
    console.error('❌ Rejected Request Body:', req.body);
    return res.status(400).json({ error: 'Post text is required' });
  }

  const termName = keywordTerm?.trim() || 'General';
  
  // Accept provided score/label if present, otherwise calculate
  let score = req.body.sentiment_score;
  let label = req.body.sentiment_label;

  if (score === undefined || !label) {
    const result = analyzeText(textContent);
    score = result.score;
    label = result.label;
  }
  
  const latitude = (Math.random() * 140 - 70).toFixed(4);
  const longitude = (Math.random() * 360 - 180).toFixed(4);

  try {
    const pool = getPool();

    // Insert or resolve keyword ID
    await pool.query('INSERT IGNORE INTO keywords (term) VALUES (?)', [termName]);
    const [kwRows] = await pool.query('SELECT id FROM keywords WHERE term = ?', [termName]);
    const keywordId = kwRows[0].id;

    // Insert new post entry
    const [result] = await pool.query(
      'INSERT INTO posts (keyword_id, post_text, sentiment_score, sentiment_label, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
      [keywordId, textContent, score, label, latitude, longitude]
    );

    res.status(201).json({ 
      success: true, 
      id: result.insertId,
      keyword: termName,
      post_text: textContent,
      sentiment_score: score,
      sentiment_label: label
    });
  } catch (err) {
    console.error('Error inserting post:', err.message);
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

// Launch DB and Express
initDB()
  .then(() => {
    const PORT = 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed DB initialization:', err.message);
  });