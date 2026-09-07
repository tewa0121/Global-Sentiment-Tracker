export default function SummaryMetrics({ posts }) {
  const total = posts.length;
  const positive = posts.filter(p => p.sentiment_label?.toLowerCase() === 'positive').length;
  const negative = posts.filter(p => p.sentiment_label?.toLowerCase() === 'negative').length;
  const avgScore = total ? (posts.reduce((sum, p) => sum + Number(p.sentiment_score || 0), 0) / total).toFixed(2) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
      <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
        <span style={{ fontSize: '12px', color: '#4b5563' }}>Total Posts</span>
        <h3 style={{ margin: '5px 0 0 0', fontSize: '20px' }}>{total}</h3>
      </div>
      <div style={{ backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
        <span style={{ fontSize: '12px', color: '#4b5563' }}>Positive</span>
        <h3 style={{ margin: '5px 0 0 0', fontSize: '20px' }}>{positive}</h3>
      </div>
      <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
        <span style={{ fontSize: '12px', color: '#4b5563' }}>Negative</span>
        <h3 style={{ margin: '5px 0 0 0', fontSize: '20px' }}>{negative}</h3>
      </div>
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #6b7280' }}>
        <span style={{ fontSize: '12px', color: '#4b5563' }}>Avg Score</span>
        <h3 style={{ margin: '5px 0 0 0', fontSize: '20px' }}>{avgScore}</h3>
      </div>
    </div>
  );
}