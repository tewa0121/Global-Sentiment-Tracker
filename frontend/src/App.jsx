import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import SentimentPieChart from './SentimentPieChart.jsx';
import SentimentLineChart from './SentimentLineChart.jsx';
import SummaryMetrics from './SummaryMetrics.jsx';
import SentimentMap from './SentimentMap.jsx';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('Technology');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

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
    const interval = setInterval(() => {
      fetchPosts();
    }, 3000);

    return () => clearInterval(interval);
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

  const uniqueKeywords = useMemo(() => {
    const set = new Set(posts.map((p) => p.keyword).filter(Boolean));
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedFilter === 'ALL') return posts;
    return posts.filter(
      (p) => p.keyword?.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [posts, selectedFilter]);

  const getBadgeColor = (label) => {
    switch (label?.toLowerCase()) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '30px auto', fontFamily: 'system-ui, sans-serif', color: '#1f2937' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '2rem' }}>Global Sentiment Tracker</h1>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ padding: '12px', width: '25%', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
        />
        <input
          type="text"
          placeholder="Enter text (e.g., 'React is awesome!')"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: '12px', width: '60%', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '12px 20px', 
            cursor: 'pointer', 
            backgroundColor: '#2563EB', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px',
            fontWeight: '600'
          }}
        >
          Analyze
        </button>
      </form>

      {/* Summary KPI Cards */}
      <SummaryMetrics posts={filteredPosts} />

      {/* Keyword Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Dashboard Analytics</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="filter" style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: '500' }}>
            Filter by Topic:
          </label>
          <select
            id="filter"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            <option value="ALL">All Keywords ({posts.length})</option>
            {uniqueKeywords.map((kw) => (
              <option key={kw} value={kw}>
                #{kw}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* World Map Section */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 15px 0' }}>Geographic Sentiment Mapping</h2>
        <SentimentMap posts={filteredPosts} />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 15px 0' }}>Sentiment Breakdown</h2>
          <SentimentPieChart posts={filteredPosts} />
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 15px 0' }}>Score Trend Over Time</h2>
          <SentimentLineChart posts={filteredPosts} />
        </div>
      </div>

      {/* Feed Section */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 15px 0' }}>
          Recent Post Feed ({filteredPosts.length})
        </h2>
        {filteredPosts.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No posts match this filter. Try selecting "All Keywords".</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredPosts.slice(0, 10).map((post) => (
              <li
                key={post.id}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontWeight: '600', color: '#2563eb', marginRight: '10px' }}>
                    #{post.keyword}
                  </span>
                  <span style={{ color: '#374151' }}>{post.post_text}</span>
                </div>
                <span
                  style={{
                    backgroundColor: getBadgeColor(post.sentiment_label),
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
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