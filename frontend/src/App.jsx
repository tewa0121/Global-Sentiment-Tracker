import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import SentimentPieChart from './SentimentPieChart.jsx';
import SentimentLineChart from './SentimentLineChart.jsx';
import SummaryMetrics from './SummaryMetrics.jsx';
import SentimentMap from './SentimentMap.jsx';
import DataExport from './DataExport.jsx';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  // --- Auth State ---
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // --- Dashboard State ---
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('Technology');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  // Fetch posts with clean cancellation handling
  const fetchPosts = useCallback(async (signal) => {
    try {
      const res = await axios.get(`${API_BASE}/posts`, { signal });
      setPosts(res.data);
    } catch (err) {
      if (
        axios.isCancel(err) ||
        err.code === 'ERR_CANCELED' ||
        err.code === 'ECONNABORTED' ||
        err.name === 'CanceledError' ||
        err.message === 'canceled' ||
        err.message === 'Request aborted'
      ) {
        return; // Silently ignore intentional request cancellations
      }
      console.error('Failed to fetch posts:', err);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPosts(controller.signal);
    const interval = setInterval(() => {
      fetchPosts(controller.signal);
    }, 3000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchPosts]);

  // Handle Login / Register Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, authForm);
      if (isRegistering) {
        alert('Registration successful! Please login.');
        setIsRegistering(false);
        setAuthForm({ username: '', password: '' });
      } else {
        setToken(res.data.token);
        setUsername(res.data.username);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  // Handle New Post Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/posts`, { text, keyword });
      setText('');
      await fetchPosts();
    } catch (err) {
      console.error('Error adding post:', err);
      alert('Failed to send data to the server.');
    } finally {
      setLoading(false);
    }
  };

  const uniqueKeywords = useMemo(() => {
    const set = new Set(posts.map((p) => p.keyword).filter(Boolean));
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesKeyword =
        selectedFilter === 'ALL' ||
        p.keyword?.toLowerCase() === selectedFilter.toLowerCase();

      let matchesDate = true;
      if (p.created_at) {
        const postDate = new Date(p.created_at);
        if (dateRange.startDate) {
          matchesDate = matchesDate && postDate >= new Date(dateRange.startDate);
        }
        if (dateRange.endDate) {
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && postDate <= end;
        }
      }

      return matchesKeyword && matchesDate;
    });
  }, [posts, selectedFilter, dateRange]);

  const getBadgeColor = (label) => {
    switch (label?.toLowerCase()) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // --- IF NOT LOGGED IN, SHOW AUTH (LOGIN / REGISTER) SCREEN ---
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '12px', width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', color: '#fff' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.75rem' }}>
            {isRegistering ? 'Create Account' : 'Dashboard Login'}
          </h2>
          {authError && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{authError}</div>}
          <form onSubmit={handleAuthSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>Username</label>
              <input
                type="text"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>Password</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                required
              />
            </div>
            <button
              type="submit"
              style={{ width: '100%', padding: '12px', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}
            >
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#60a5fa', cursor: 'pointer' }} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login here' : "Don't have an account? Register"}
          </p>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW (WHEN LOGGED IN) ---
  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', fontFamily: 'system-ui, sans-serif', color: '#1f2937', padding: '0 15px' }}>
      
      {/* Header with Welcome and Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Global Sentiment Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.95rem', color: '#4b5563' }}>Welcome, <b>{username}</b></span>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 14px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ padding: '12px', width: '25%', borderRadius: '6px', border: '1px solid #d1d5db' }}
        />
        <input
          type="text"
          placeholder="Enter text to analyze..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: '12px', width: '60%', borderRadius: '6px', border: '1px solid #d1d5db' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px 20px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            backgroundColor: loading ? '#9ca3af' : '#2563EB', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px',
            fontWeight: '600'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {/* Summary Row */}
      <SummaryMetrics posts={filteredPosts} />

      {/* Filter and Export Component */}
      <DataExport posts={filteredPosts} onDateFilter={setDateRange} />

      {/* Topics Control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Analytics Breakdown</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="filter" style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: '500' }}>Filter Topic:</label>
          <select
            id="filter"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff' }}
          >
            <option value="ALL">All Keywords ({posts.length})</option>
            {uniqueKeywords.map((kw) => (
              <option key={kw} value={kw}>#{kw}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Visualization */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', backgroundColor: '#fff', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Global Sentiment Map</h3>
        <SentimentMap posts={filteredPosts} />
      </div>

      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Distribution</h3>
          <SentimentPieChart posts={filteredPosts} />
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Score Timeline</h3>
          <SentimentLineChart posts={filteredPosts} />
        </div>
      </div>

      {/* Live Feed List */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', backgroundColor: '#fff' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Live Feed ({filteredPosts.length})</h3>
        {filteredPosts.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No matching posts found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredPosts.slice(0, 10).map((post) => (
              <li key={post.id} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#2563eb', marginRight: '10px' }}>#{post.keyword}</span>
                  <span style={{ color: '#374151' }}>{post.post_text}</span>
                </div>
                <span style={{ backgroundColor: getBadgeColor(post.sentiment_label), color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
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