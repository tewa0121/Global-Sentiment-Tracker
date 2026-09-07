import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SentimentLineChart({ posts = [] }) {
  const chartData = useMemo(() => {
    return [...posts]
      .reverse()
      .slice(-20) // Keep standard 20 entries to prevent chart overcrowding
      .map((p) => ({
        time: p.created_at
          ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'N/A',
        score: p.sentiment_score ?? 0
      }));
  }, [posts]);

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#2563eb" 
            strokeWidth={2} 
            dot={{ r: 3 }}
            isAnimationActive={false} // Stops crash during 3s polling stream
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}