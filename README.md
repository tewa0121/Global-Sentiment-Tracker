# Global Sentiment Tracker

A live dashboard that scores the sentiment of posts and shows it by topic, over time and on a world map.

- **Backend** (`backend/`): Node.js, Express 5 and MySQL. Scores each post with the [`sentiment`](https://www.npmjs.com/package/sentiment) package (AFINN word list, English only), then stores and serves it.
- **Frontend** (`frontend/`): React 19 and Vite. Polls the API every 3 seconds and draws the headline mood, a Leaflet map, a timeline, a topic board and a live feed. Light and dark themes.

## What you can do in the app

- Read the overall mood in one sentence, with a negative / neutral / positive bar.
- Score your own post, with an optional location picked by clicking the map.
- Filter by topic and date range, then export what you see as CSV.
- Select a topic on the board to filter everything; select a feed item with a pin to fly to it on the map.
- Hover the timeline to see which post each dot is.

## Quick start

You need Node.js 20+ and a running MySQL (MAMP, XAMPP, Docker or a local install).

```bash
# 1. API
cd backend
cp .env.example .env        # then edit DB_PORT / DB_USER / DB_PASSWORD for your MySQL
npm install
npm start                   # http://localhost:5000  (creates the database and tables on first run)

# 2. Demo data (optional, second terminal). Sends synthetic posts with sample locations.
cd backend
npm run generate

# 3. Web app (third terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The dev server forwards `/api` to `http://localhost:5000`, so no URL needs to be configured. To point the app at a hosted API, set `VITE_API_URL` (see `frontend/.env.example`).

Run the backend tests with `cd backend && npm test`, and lint the frontend with `cd frontend && npm run lint`.

## API

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | `{ status, database }` |
| `GET` | `/api/posts?limit=100&offset=0` | Newest first. `limit` 1 to 100. |
| `POST` | `/api/posts` | Body: `post_text` (required, up to 5000 characters), `keyword` (optional, defaults to `General`), `latitude` and `longitude` (optional, must be sent together). The label is always computed on the server. |

## Project layout

```
backend/
  server.js            Express app, validation, rate limit
  generator.js         Demo post generator (synthetic data)
  config/              env loader and MySQL pool
  utils/sentiment.js   Text analysis
  test/                node:test unit tests
frontend/src/
  App.jsx              State, filters, layout
  components/          Header, MoodHero, Composer, SentimentMap, LiveFeed, Timeline, TopicBoard, FilterBar
  hooks/               usePosts (polling), useTheme, useNow, useElementSize
  lib/                 api, stats, csv, format, palette
```

## Known limits

- Scores are lexicon-based and English-only, so sarcasm and other languages are not understood.
- The dashboard works on the latest 100 posts the API returns.
- The in-memory rate limiter suits a single local instance; use a shared store for multi-instance deployments.
