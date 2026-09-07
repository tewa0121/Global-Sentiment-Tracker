const axios = require('axios');

const MOCK_KEYWORDS = ['Technology', 'Climate', 'Crypto', 'AI', 'Sports'];

const MOCK_POSTS = [
  // Positive
  { text: "This new AI framework is insanely fast and simple to build with!", keyword: "AI" },
  { text: "Love how much progress we are making in clean solar energy.", keyword: "Climate" },
  { text: "React and Node combined make web development a total breeze.", keyword: "Technology" },
  { text: "What a fantastic match today, absolute world class performance!", keyword: "Sports" },
  
  // Negative
  { text: "Database crashes during peak traffic hours are completely unacceptable.", keyword: "Technology" },
  { text: "Global temperatures reaching historic highs is very concerning.", keyword: "Climate" },
  { text: "Market drop today wiped out weeks of steady gains.", keyword: "Crypto" },
  { text: "The new UI update feels sluggish and breaks basic accessibility.", keyword: "Technology" },

  // Neutral
  { text: "Attending the developer conference in downtown today.", keyword: "Technology" },
  { text: "The weekly weather report predicts mild temperatures and light rain.", keyword: "Climate" },
  { text: "New regulation guidelines published by the committee.", keyword: "Crypto" }
];

async function sendMockPost() {
  const randomPost = MOCK_POSTS[Math.floor(Math.random() * MOCK_POSTS.length)];

  try {
    const res = await axios.post('http://localhost:5000/api/posts', randomPost);
    console.log(`[Auto-Stream] Added post: "${res.data.post_text}" -> (${res.data.sentiment_label.toUpperCase()})`);
  } catch (err) {
    console.error('[Auto-Stream Error]:', err.message);
  }
}

// Stream a new post every 3 seconds
console.log('🚀 Starting Mock Data Generator (sending post every 3s)...');
setInterval(sendMockPost, 3000);