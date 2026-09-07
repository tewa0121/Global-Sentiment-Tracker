import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Live Data Fetching (polling every 3s)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/posts');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    const interval = setInterval(fetchPosts, 3000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // 2. Safe metric calculations using useMemo (prevents setState render loops)
  const stats = useMemo(() => {
    const total = posts.length;
    const positive = posts.filter((p) => p.sentiment_label === 'positive').length;
    const negative = posts.filter((p) => p.sentiment_label === 'negative').length;
    const neutral = posts.filter((p) => p.sentiment_label === 'neutral').length;

    return { total, positive, negative, neutral };
  }, [posts]);

  // 3. Format posts for live display (most recent 20)
  const chartData = useMemo(() => {
    return [...posts].reverse().slice(-20);
  }, [posts]);

  if (loading) {
    return <div style={styles.loading}>Loading Dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>⚡ Real-Time Sentiment Dashboard</h1>

      {/* Stats Overview */}
      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <h3>Total Posts</h3>
          <p style={styles.cardNumber}>{stats.total}</p>
        </div>
        <div style={{ ...styles.card, borderTop: '4px solid #10B981' }}>
          <h3>Positive</h3>
          <p style={{ ...styles.cardNumber, color: '#10B981' }}>{stats.positive}</p>
        </div>
        <div style={{ ...styles.card, borderTop: '4px solid #EF4444' }}>
          <h3>Negative</h3>
          <p style={{ ...styles.cardNumber, color: '#EF4444' }}>{stats.negative}</p>
        </div>
        <div style={{ ...styles.card, borderTop: '4px solid #6B7280' }}>
          <h3>Neutral</h3>
          <p style={{ ...styles.cardNumber, color: '#6B7280' }}>{stats.neutral}</p>
        </div>
      </div>

      {/* Main Sentiment Trend Chart */}
      <div style={styles.chartBox}>
        <h2>Live Sentiment Score Stream</h2>
        {/* Explicit pixel height on parent prevents infinite container recalculations */}
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="keyword" />
              <YAxis />
              <Tooltip />
              {/* isAnimationActive={false} prevents Recharts from crashing during rapid 3s streams */}
              <Line
                type="monotone"
                dataKey="sentiment_score"
                stroke="#3B82F6"
                strokeWidth={2}
                isAnimationActive={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment Breakdown Chart */}
      <div style={styles.chartBox}>
        <h2>Sentiment Distribution</h2>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Positive', count: stats.positive, fill: '#10B981' },
                { name: 'Negative', count: stats.negative, fill: '#EF4444' },
                { name: 'Neutral', count: stats.neutral, fill: '#6B7280' }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Inline styles for quick layout setup
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#F9FAFB',
    minHeight: '100vh'
  },
  header: {
    margin: '0 0 20px 0',
    color: '#111827'
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    fontSize: '18px'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '8px 0 0 0'
  },
  chartBox: {
    backgroundColor: '#FFFFFF',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  }
};