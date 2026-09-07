import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = { positive: '#10B981', negative: '#EF4444', neutral: '#6B7280' };

export default function SentimentPieChart({ posts = [] }) {
  const data = useMemo(() => {
    const positiveCount = posts.filter(p => p.sentiment_label?.toLowerCase() === 'positive').length;
    const negativeCount = posts.filter(p => p.sentiment_label?.toLowerCase() === 'negative').length;
    const neutralCount = posts.filter(p => p.sentiment_label?.toLowerCase() === 'neutral').length;

    return [
      { name: 'Positive', value: positiveCount, color: COLORS.positive },
      { name: 'Negative', value: negativeCount, color: COLORS.negative },
      { name: 'Neutral', value: neutralCount, color: COLORS.neutral }
    ];
  }, [posts]);

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="50%" 
            outerRadius={80} 
            label={({ value }) => (value > 0 ? value : '')}
            isAnimationActive={false} // Stops crash during 3s polling stream
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}