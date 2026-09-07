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

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', fontFamily: 'sans-serif' }}>
      <h1>Global Sentiment Tracker</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ padding: '10px', width: '30%' }}
        />
        <input
          type="text"
          placeholder="Enter text (e.g., 'React is awesome!')"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: '10px', width: '50%' }}
        />
        <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer' }}>
          Analyze
        </button>
      </form>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
        <h2>Live Sentiment Breakdown</h2>
        <SentimentPieChart posts={posts} />
      </div>
    </div>
  );
}