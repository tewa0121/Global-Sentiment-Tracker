import { useState } from 'react';

export default function DataExport({ posts, onDateFilter }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFilter = (e) => {
    e.preventDefault();
    if (onDateFilter) {
      onDateFilter({ startDate, endDate });
    }
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    if (onDateFilter) {
      onDateFilter({ startDate: '', endDate: '' });
    }
  };

  const exportToCSV = () => {
    if (!posts || posts.length === 0) {
      alert('No data available to export.');
      return;
    }

    // CSV Headers
    const headers = ['ID', 'Keyword', 'Post Text', 'Sentiment Label', 'Sentiment Score', 'Created At'];

    // Map rows
    const rows = posts.map((post) => [
      post.id,
      `"${post.keyword || ''}"`,
      `"${(post.post_text || '').replace(/"/g, '""')}"`, // Escape inner double quotes
      post.sentiment_label,
      post.sentiment_score,
      post.created_at || new Date().toISOString()
    ]);

    // Construct CSV Content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n');

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sentiment_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      
      {/* Date Range Filter Form */}
      <form onSubmit={handleFilter} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Date Filter:</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
        />
        <span style={{ color: '#6b7280' }}>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
        />
        <button
          type="submit"
          style={{ padding: '8px 14px', backgroundColor: '#4b5563', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Apply
        </button>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleClearFilter}
            style={{ padding: '8px 12px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Clear
          </button>
        )}
      </form>

      {/* CSV Export Button */}
      <button
        onClick={exportToCSV}
        style={{ padding: '8px 16px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
      >
        📥 Export CSV
      </button>

    </div>
  );
}