require('./config/env')();
const axios = require('axios');

const mockPosts = [
  { keyword: 'Technology', post_text: 'This application is great, awesome, fast, and amazing!' },
  { keyword: 'AI', post_text: 'Terrible system, sluggish performance, crash and bug issues.' },
  { keyword: 'Coffee', post_text: 'Standard automated streaming log check.' },
  { keyword: 'React', post_text: 'Fantastic library, love the speed and excellent design!' },
  { keyword: 'Nodejs', post_text: 'Horrible server fail, bad connection, broken routes.' },
  { keyword: 'MAMP', post_text: 'Routine local host database operational diagnostic.' },
  { keyword: 'Cloud', post_text: 'Incredible uptime, seamless scaling, and wonderful developer experience.' },
  { keyword: 'Database', post_text: 'Data corruption error, severe latency, completely unusable.' },
  { keyword: 'Security', post_text: 'Vulnerability patched successfully, stable and safe architecture.' }
];

const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api/posts`;
const INTERVAL_MS = Number.parseInt(process.env.GENERATOR_INTERVAL_MS || '3000', 10);
let timer;
let stopping = false;

async function sendMockPost() {
  if (stopping) return;
  try {
    const post = mockPosts[Math.floor(Math.random() * mockPosts.length)];
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

module.exports = { sendMockPost, mockPosts };