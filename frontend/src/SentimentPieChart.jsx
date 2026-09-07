import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = { positive: '#10B981', negative: '#EF4444', neutral: '#6B7280' };

export default function SentimentPieChart({ posts }) {
  const counts = posts.reduce((acc, p) => {
    const key = p.sentiment_label?.toLowerCase() || 'neutral';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { name: 'Positive', value: counts.positive || 0, color: COLORS.positive },
    { name: 'Negative', value: counts.negative || 0, color: COLORS.negative },
    { name: 'Neutral', value: counts.neutral || 0, color: COLORS.neutral }
  ];

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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