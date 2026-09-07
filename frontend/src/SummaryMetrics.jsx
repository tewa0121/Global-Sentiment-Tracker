export default function SummaryMetrics({ posts }) {
  const total = posts.length;

  const positiveCount = posts.filter(
    (p) => p.sentiment_label?.toLowerCase() === 'positive'
  ).length;

  const positivePercentage = total > 0 
    ? Math.round((positiveCount / total) * 100) 
    : 0;

  const avgScore = total > 0
    ? (posts.reduce((sum, p) => sum + Number(p.sentiment_score || 0), 0) / total).toFixed(1)
    : 0;

  const cardStyle = {
    flex: 1,
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    textAlign: 'center'
  };

  const labelStyle = {
    fontSize: '0.85rem',
    color: '#6b7280',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const valueStyle = {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827'
  };

  return (
    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
      <div style={cardStyle}>
        <div style={labelStyle}>Total Posts</div>
        <div style={valueStyle}>{total}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Positive Ratio</div>
        <div style={{ ...valueStyle, color: '#10B981' }}>{positivePercentage}%</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Avg Score</div>
        <div style={{ ...valueStyle, color: avgScore >= 0 ? '#2563EB' : '#EF4444' }}>
          {avgScore > 0 ? `+${avgScore}` : avgScore}
        </div>
      </div>
    </div>
  );
}