require('./config/env')();
const axios = require('axios');

// DEMO DATA ONLY. These posts and locations are synthetic so the dashboard has
// something to show. The API itself never invents a location for a real post.
const mockPosts = [
  { keyword: 'Technology', post_text: 'This application is great, awesome, fast, and amazing!' },
  { keyword: 'Technology', post_text: 'Honestly the new release is a wonderful step forward.' },
  { keyword: 'AI', post_text: 'Terrible system, sluggish performance, crash and bug issues.' },
  { keyword: 'AI', post_text: 'The assistant is impressive and genuinely helpful, I love it.' },
  { keyword: 'Coffee', post_text: 'Standard automated streaming log check.' },
  { keyword: 'Coffee', post_text: 'Best espresso in town, absolutely delicious.' },
  { keyword: 'React', post_text: 'Fantastic library, love the speed and excellent design!' },
  { keyword: 'React', post_text: 'Another confusing rewrite, frustrating and annoying migration.' },
  { keyword: 'Nodejs', post_text: 'Horrible server fail, bad connection, broken routes.' },
  { keyword: 'Nodejs', post_text: 'Solid release, stable and reliable under load.' },
  { keyword: 'MAMP', post_text: 'Routine local host database operational diagnostic.' },
  { keyword: 'Cloud', post_text: 'Incredible uptime, seamless scaling, and wonderful developer experience.' },
  { keyword: 'Cloud', post_text: 'Outage again, awful support and a painful bill.' },
  { keyword: 'Database', post_text: 'Data corruption error, severe latency, completely unusable.' },
  { keyword: 'Database', post_text: 'Backups finished and the query plan looks good.' },
  { keyword: 'Security', post_text: 'Vulnerability patched successfully, stable and safe architecture.' },
  { keyword: 'Security', post_text: 'Breach reported, worried and angry customers.' },
];

// Rough city coordinates [latitude, longitude] used for demo map markers.
const cities = [
  [40.71, -74.0], [37.77, -122.42], [19.43, -99.13], [-23.55, -46.63], [-34.6, -58.38],
  [51.51, -0.13], [48.86, 2.35], [52.52, 13.4], [41.9, 12.5], [59.33, 18.07],
  [30.04, 31.24], [6.52, 3.38], [-1.29, 36.82], [9.03, 38.74], [-26.2, 28.04],
  [28.61, 77.21], [19.08, 72.88], [1.35, 103.82], [35.68, 139.69], [37.57, 126.98],
  [31.23, 121.47], [-33.87, 151.21], [-36.85, 174.76], [25.2, 55.27],
];

const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api/posts`;
const INTERVAL_MS = Number.parseInt(process.env.GENERATOR_INTERVAL_MS || '3000', 10);
const WITH_LOCATIONS = (process.env.GENERATOR_LOCATIONS || 'on').toLowerCase() !== 'off';
let timer;
let stopping = false;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomLocation() {
  const [lat, lon] = pick(cities);
  const jitter = () => (Math.random() - 0.5) * 3; // spread markers around each city
  return {
    latitude: Number(Math.max(-85, Math.min(85, lat + jitter())).toFixed(4)),
    longitude: Number(Math.max(-180, Math.min(180, lon + jitter())).toFixed(4)),
  };
}

async function sendMockPost() {
  if (stopping) return;
  try {
    const post = { ...pick(mockPosts), ...(WITH_LOCATIONS ? randomLocation() : {}) };
    const response = await axios.post(API_URL, post, { timeout: 5000 });
    console.log(`[Mock post] #${post.keyword}: ${response.data.sentiment_label} (${response.data.sentiment_score})`);
  } catch (error) {
    console.error('[Mock generator]', error.response?.data?.error || error.message);
  }
}

if (require.main === module) {
  console.warn('DEMO MODE: this script generates synthetic sample posts, not real global data.');
  console.warn('It is enabled via: npm run generate');
  sendMockPost();
  timer = setInterval(sendMockPost, INTERVAL_MS);
  const stop = () => {
    stopping = true;
    if (timer) clearInterval(timer);
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

module.exports = { sendMockPost, mockPosts, cities };
