import { useState } from 'react';

export default function DataExport({ posts, onDateFilter }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    onDateFilter({ startDate: start, endDate: end });
  };

  const handleClear = () => {
    setStart('');
    setEnd('');
    onDateFilter({ startDate: '', endDate: '' });
  };

  const exportCSV = () => {
    if (!posts.length) return alert('No data available to export.');
    const headers = ['ID', 'Keyword', 'Text', 'Score', 'Label', 'Date'];
    const rows = posts.map(p => [
      p.id,
      `"${p.keyword || ''}"`,
      `"${p.post_text?.replace(/"/g, '""') || ''}"`,
      p.sentiment_score,
      p.sentiment_label,
      p.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentiment_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
      <form onSubmit={handleApply} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontWeight: '600', fontSize: '14px' }}>Date Range:</span>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <span>to</span>
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>Apply</button>
        <button type="button" onClick={handleClear} style={{ backgroundColor: '#9ca3af', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>Clear</button>
      </form>
      <button onClick={exportCSV} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
        📥 Export CSV
      </button>
    </div>
  );
}