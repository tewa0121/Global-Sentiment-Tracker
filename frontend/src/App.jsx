import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SentimentPieChart from './SentimentPieChart.jsx';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('Technology');

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to connect to backend:', err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await axios.post('http://localhost:5000/api/posts', { text, keyword });
      setText('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to add post:', err);
    }
  };

  const getBadgeColor = (label) => {
    switch (label?.toLowerCase()) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '30px auto', fontFamily: 'sans-serif' }}>
      <h1>Global Sentiment Tracker</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ padding: '10px', width: '30%', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Enter text (e.g., 'React is awesome!')"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: '10px', width: '55%', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 18px', cursor: 'pointer', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Analyze
        </button>
      </form>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '25px', backgroundColor: '#FAFBA' }}>
        <h2>Live Sentiment Breakdown</h2>
        <SentimentPieChart posts={posts} />
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
        <h2>Recent Post Feed ({posts.length})</h2>
        {posts.length === 0 ? (
          <p style={{ color: '#666' }}>No posts found. Add one above!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {posts.map((post) => (
              <li
                key={post.id}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold', color: '#3b82f6', marginRight: '10px' }}>
                    #{post.keyword}
                  </span>
                  <span>{post.post_text}</span>
                </div>
                <span
                  style={{
                    backgroundColor: getBadgeColor(post.sentiment_label),
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {post.sentiment_label} ({post.sentiment_score})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}