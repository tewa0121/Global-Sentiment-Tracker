const axios = require('axios');

const mockPosts = [
  { 
    keyword: 'Technology', 
    post_text: 'This application is great, awesome, fast, and amazing!',
    sentiment_score: 12,
    sentiment_label: 'positive'
  },
  { 
    keyword: 'AI', 
    post_text: 'Terrible system, sluggish performance, crash and bug issues.',
    sentiment_score: -8,
    sentiment_label: 'negative'
  },
  { 
    keyword: 'Coffee', 
    post_text: 'Standard automated streaming log check.',
    sentiment_score: 0,
    sentiment_label: 'neutral'
  },
  { 
    keyword: 'React', 
    post_text: 'Fantastic library, love the speed and excellent design!',
    sentiment_score: 9,
    sentiment_label: 'positive'
  },
  { 
    keyword: 'Nodejs', 
    post_text: 'Horrible server fail, bad connection, broken routes.',
    sentiment_score: -6,
    sentiment_label: 'negative'
  },
  { 
    keyword: 'MAMP', 
    post_text: 'Routine local host database operational diagnostic.',
    sentiment_score: 0,
    sentiment_label: 'neutral'
  }
];

const API_URL = 'http://localhost:5000/api/posts';

async function sendMockPost() {
  try {
    const randomPost = mockPosts[Math.floor(Math.random() * mockPosts.length)];
    const response = await axios.post(API_URL, randomPost, {
      headers: { 'Content-Type': 'application/json' }
    });

    const label = response.data?.sentiment_label || 'NEUTRAL';
    const score = response.data?.sentiment_score ?? 0;

    console.log(`✅ [Post Sent]: #${randomPost.keyword} | Label: ${label.toUpperCase()} (Score: ${score})`);
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    console.error(`[Error]: ${msg}`);
  }
}

console.log('🚀 Starting Mock Data Generator (sending post every 3s)...');
setInterval(sendMockPost, 3000);