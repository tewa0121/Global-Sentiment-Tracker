import React, { useState } from 'react';

export default function DataExport({ posts = [], onDateFilter }) {
  const [tempStart, setTempStart] = useState('');
  const [tempEnd, setTempEnd] = useState('');

  // Apply date filters only when clicked
  const handleApplyFilter = () => {
    if (onDateFilter) {
      onDateFilter({
        startDate: tempStart,
        endDate: tempEnd
      });
    }
  };

  // Reset date filters
  const handleResetFilter = () => {
    setTempStart('');
    setTempEnd('');
    if (onDateFilter) {
      onDateFilter({ startDate: '', endDate: '' });
    }
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!posts || posts.length === 0) {
      alert('No data to export!');
      return;
    }

    const headers = ['ID', 'Keyword', 'Text', 'Sentiment', 'Score', 'Latitude', 'Longitude', 'Created At'];
    const rows = posts.map((p) => [
      p.id,
      `"${p.keyword || ''}"`,
      `"${p.post_text ? p.post_text.replace(/"/g, '""') : ''}"`,
      p.sentiment_label,
      p.sentiment_score,
      p.latitude || '',
      p.longitude || '',
      `"${p.created_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentiment_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
      {/* Start Date Input */}
      <div>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', marginRight: '6px' }}>Start Date:</label>
        <input 
          type="date" 
          value={tempStart}
          onChange={(e) => setTempStart(e.target.value)} 
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db' }} 
        />
      </div>

      {/* End Date Input */}
      <div>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', marginRight: '6px' }}>End Date:</label>
        <input 
          type="date" 
          value={tempEnd}
          onChange={(e) => setTempEnd(e.target.value)} 
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db' }} 
        />
      </div>

      {/* Apply Button */}
      <button
        type="button"
        onClick={handleApplyFilter}
        style={{ backgroundColor: '#2563EB', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
      >
        Apply
      </button>

      {/* Reset Button */}
      <button
        type="button"
        onClick={handleResetFilter}
        style={{ backgroundColor: '#6B7280', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}
      >
        Reset
      </button>

      {/* CSV Export Button */}
      <button
        type="button"
        onClick={handleExportCSV}
        style={{ marginLeft: 'auto', backgroundColor: '#10B981', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
      >
        📥 Export CSV
      </button>
    </div>
  );
}