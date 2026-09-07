// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const COLORS = { POSITIVE: '#10B981', NEGATIVE: '#EF4444', NEUTRAL: '#6B7280' };

// export default function SentimentPieChart({ posts }) {
//   const counts = (posts || []).reduce(
//     (acc, post) => {
//       const key = (post.sentiment_label || 'neutral').toUpperCase();
//       acc[key] = (acc[key] || 0) + 1;
//       return acc;
//     },
//     { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 }
//   );

//   const chartData = Object.keys(counts).map((key) => ({
//     name: key,
//     value: counts[key],
//     color: COLORS[key]
//   }));

//   return (
//     <div style={{ width: '100%', height: 300 }}>
//       <ResponsiveContainer>
//         <PieChart>
//           <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
//             {chartData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//           <Tooltip />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }