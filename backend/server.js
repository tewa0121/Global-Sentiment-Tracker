require('./config/env')();
const express = require('express');
const cors = require('cors');
const { initDB, getPool, closeDB } = require('./config/db');
const { analyzeText, MAX_TEXT_LENGTH } = require('./utils/sentiment');

const app = express();
const PORT = Number.parseInt(process.env.PORT || '5000', 10);
const MAX_KEYWORD_LENGTH = 100;
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = Number.parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60', 10);
const requestCounts = new Map();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    // No Origin is common for CLI tools and local health checks.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '32kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));

// Lightweight per-IP in-memory rate limit. For multi-instance production deploys,
// use a shared store (for example Redis) and a maintained rate-limit middleware.
app.use((req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  let entry = requestCounts.get(key);
  if (!entry || now - entry.start >= WINDOW_MS) {
    entry = { start: now, count: 0 };
    requestCounts.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    res.set('Retry-After', String(Math.ceil((entry.start + WINDOW_MS - now) / 1000)));
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }
  // Prevent this map growing without bound during long-lived local sessions.
  if (requestCounts.size > 5000) {
    for (const [ip, value] of requestCounts) {
      if (now - value.start >= WINDOW_MS) requestCounts.delete(ip);
    }
  }
  next();
});

app.get('/api/health', async (_req, res) => {
  try {
    await getPool().query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (_error) {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.get('/api/posts', async (req, res) => {
  const limitRaw = req.query.limit === undefined ? DEFAULT_PAGE_SIZE : Number(req.query.limit);
  const offsetRaw = req.query.offset === undefined ? 0 : Number(req.query.offset);
  if (!Number.isInteger(limitRaw) || limitRaw < 1 || limitRaw > MAX_PAGE_SIZE) {
    return res.status(400).json({ error: `limit must be an integer between 1 and ${MAX_PAGE_SIZE}` });
  }
  if (!Number.isInteger(offsetRaw) || offsetRaw < 0 || offsetRaw > 1_000_000) {
    return res.status(400).json({ error: 'offset must be an integer between 0 and 1000000' });
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT p.id, k.term AS keyword, p.post_text, p.sentiment_score,
             p.sentiment_label, p.latitude, p.longitude, p.created_at
      FROM posts p
      JOIN keywords k ON p.keyword_id = k.id
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT ? OFFSET ?
    `, [limitRaw, offsetRaw]);
    res.set('Cache-Control', 'no-store');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

app.post('/api/posts', async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const rawText = body.post_text ?? body.text ?? body.content ?? body.message;
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({ error: 'Post text is required and must be a string' });
  }
  if (rawText.trim().length > MAX_TEXT_LENGTH) {
    return res.status(413).json({ error: `Post text must be ${MAX_TEXT_LENGTH} characters or fewer` });
  }

  const rawKeyword = body.keyword === undefined ? 'General' : body.keyword;
  if (typeof rawKeyword !== 'string') {
    return res.status(400).json({ error: 'Keyword must be a string' });
  }
  const keyword = rawKeyword.trim() || 'General';
  if (keyword.length > MAX_KEYWORD_LENGTH) {
    return res.status(400).json({ error: `Keyword must be ${MAX_KEYWORD_LENGTH} characters or fewer` });
  }

  // Accept coordinates only when both are provided and valid. Never invent location.
  let latitude = null;
  let longitude = null;
  if (body.latitude !== undefined || body.longitude !== undefined) {
    const lat = Number(body.latitude);
    const lon = Number(body.longitude);
    if (
      body.latitude === undefined || body.longitude === undefined ||
      body.latitude === null || body.longitude === null ||
      !Number.isFinite(lat) || !Number.isFinite(lon) ||
      lat < -90 || lat > 90 || lon < -180 || lon > 180
    ) {
      return res.status(400).json({ error: 'Latitude and longitude must be supplied together and be within valid ranges' });
    }
    latitude = lat;
    longitude = lon;
  }

  let analysis;
  try {
    analysis = analyzeText(rawText);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const pool = getPool();
    await pool.query('INSERT IGNORE INTO keywords (term) VALUES (?)', [keyword]);
    const [keywordRows] = await pool.query('SELECT id FROM keywords WHERE term = ?', [keyword]);
    if (!keywordRows.length) throw new Error('Keyword lookup failed');
    const [result] = await pool.query(
      `INSERT INTO posts
       (keyword_id, post_text, sentiment_score, sentiment_label, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [keywordRows[0].id, rawText.trim(), analysis.score, analysis.label, latitude, longitude]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      keyword,
      post_text: rawText.trim(),
      sentiment_score: analysis.score,
      sentiment_label: analysis.label,
      latitude,
      longitude,
    });
  } catch (err) {
    console.error('Error inserting post:', err.message);
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

app.use((err, _req, res, _next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON request body' });
  }
  if (err && err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  console.error('Unhandled request error:', err?.message || err);
  return res.status(500).json({ error: 'Internal server error' });
});

let server;
async function start() {
  await initDB();
  server = app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}
async function shutdown(signal) {
  console.log(`${signal} received; shutting down.`);
  if (server) await new Promise((resolve) => server.close(resolve));
  try { await closeDB(); } catch (err) { console.error('Database shutdown error:', err.message); }
  process.exit(0);
}
if (require.main === module) {
  start().catch((err) => {
    console.error('Server startup failed:', err.message);
    process.exit(1);
  });
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = { app, start, analyzeText };
