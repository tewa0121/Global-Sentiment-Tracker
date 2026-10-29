# Global Sentiment Tracker

A live dashboard that scores the sentiment of posts and shows it by topic, over time and on a world map.

![Dashboard overview](docs/screenshots/dashboard.png)

**Live demo:** _add your link here_  ·  **Stack:** React 19, Vite, Leaflet, Node.js, Express 5, MySQL

## Features

- **Mood at a glance.** One sentence and a negative / neutral / positive bar summarize the conversation.
- **Live updates.** The dashboard polls the API every 3 seconds, pauses when the tab is hidden, and highlights new posts.
- **World map.** Every located post is a dot sized by score strength. Select a feed item to fly to it.
- **Score your own post.** Write text, pick a topic, and optionally click the map to give it a location.
- **Topics and filters.** Compare average sentiment per topic, filter the whole dashboard by topic and date range.
- **Mood over time.** A hand-built SVG timeline with per-post dots, a rolling average and a hover tooltip.
- **CSV export** of whatever is filtered, safe against spreadsheet formula injection.
- **Light and dark themes**, mobile layout, keyboard focus styles and reduced-motion support.
- **Clear failure states.** An offline banner explains what is wrong and retries automatically.

| Map | Timeline and topics |
| --- | --- |
| ![Map and live feed](docs/screenshots/map.png) | ![Timeline and topic board](docs/screenshots/insights.png) |

## How it works

```
Browser (React + Vite)  ──/api──▶  Express API  ──▶  MySQL
        ▲                              │
        └── polls every 3 s            └── scores text with the AFINN word list
```

1. A post (text, topic, optional coordinates) is sent to `POST /api/posts`.
2. The server validates it, scores it, and derives the label from the score. Clients can never set the label.
3. The dashboard reads the latest posts from `GET /api/posts` and computes every chart in the browser.

## Quick start

You need Node.js 20+ and a running MySQL (MAMP, XAMPP, Docker or a local install).

```bash
# 1. API
cd backend
cp .env.example .env        # edit DB_PORT / DB_USER / DB_PASSWORD for your MySQL
npm install
npm start                   # http://localhost:5000, creates the database and tables on first run

# 2. Demo data (optional, second terminal): synthetic posts with sample city locations
cd backend
npm run generate

# 3. Web app (third terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The dev server forwards `/api` to `http://localhost:5000`, so no URL needs configuring.

Tests: `cd backend && npm test`. Frontend lint and build: `cd frontend && npm run lint && npm run build`.

## API

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | `{ status, database }` |
| `GET` | `/api/posts?limit=100&offset=0` | Newest first. `limit` 1 to 100. |
| `POST` | `/api/posts` | Body: `post_text` (required, up to 5000 characters), `keyword` (optional, defaults to `General`), `latitude` and `longitude` (optional, sent together). |

## Engineering notes

- **Server-side validation** for text length, keyword length, coordinate ranges and JSON size.
- **Per-IP rate limiting** and an allow-list for CORS origins.
- **Parameterized SQL** everywhere, and the schema is created without ever dropping data.
- **No chart library.** The timeline and topic board are small SVG and CSS components, which keeps the bundle light and the behavior fully controlled.
- **Graceful polling.** Requests are cancelled on unmount, skipped while the tab is hidden, and retried after failures.

## Deploying

See [docs/PORTFOLIO.md](docs/PORTFOLIO.md) for a step-by-step guide (frontend on Vercel or Netlify, API on Render or Railway, hosted MySQL).

## Known limits and next steps

- Scoring is lexicon-based and English-only, so sarcasm and other languages (for example Amharic) are not understood. A multilingual model is the natural next step.
- The dashboard works on the latest 100 posts. A `/api/stats` endpoint would let totals cover all posts.
- Posting is open. For a public deployment, add an API key or user accounts before accepting real traffic.
- The in-memory rate limiter suits a single instance; use a shared store (for example Redis) for several.

## License

MIT, see [LICENSE](LICENSE).
