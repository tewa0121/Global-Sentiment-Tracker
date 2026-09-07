import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SentimentLineChart({ posts }) {
  const chartData = [...posts]
    .reverse()
    .slice(-15)
    .map((post) => {
      const date = new Date(post.created_at || Date.now());
      return {
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        score: Number(post.sentiment_score),
        text: post.post_text
      };
    });

  return (
    <div style={{ width: '100%', height: 260, marginTop: '10px' }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" domain={[-5, 5]} style={{ fontSize: '12px' }} />
          <Tooltip 
            formatter={(value) => [`Score: ${value}`, 'Sentiment']}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#2563EB" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#2563EB' }} 
            activeDot={{ r: 7 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}