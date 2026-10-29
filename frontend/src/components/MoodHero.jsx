import { describeMood } from '../lib/stats.js';
import { signed } from '../lib/format.js';

const SEGMENTS = [
  { key: 'negative', label: 'Negative', tone: 'neg' },
  { key: 'neutral', label: 'Neutral', tone: 'neu' },
  { key: 'positive', label: 'Positive', tone: 'pos' },
];

export default function MoodHero({ summary, topicCount, topic, loading }) {
  const subject = topic ? `#${topic}` : 'Conversation';
  const mood = loading
    ? { headline: 'Loading the latest posts…', detail: '' }
    : describeMood(summary, subject);
  const empty = !loading && summary.total === 0;
  const detail = empty
    ? 'Score a post on the right, or run npm run generate in the backend folder to stream demo posts.'
    : mood.detail;

  const stats = [
    { label: 'Posts', value: summary.total },
    { label: 'Average score', value: signed(summary.avg, 1) },
    { label: 'Topics', value: topicCount },
    { label: 'On the map', value: summary.located },
  ];

  return (
    <section className="mood" aria-labelledby="mood-headline">
      <h1 id="mood-headline" className="mood__headline">
        {mood.headline}
      </h1>
      {detail && <p className="mood__detail">{detail}</p>}

      <div
        className="mood__bar"
        role="img"
        aria-label={`${summary.negative} negative, ${summary.neutral} neutral, ${summary.positive} positive posts`}
      >
        {SEGMENTS.map(({ key, tone }) => (
          <span
            key={key}
            className="mood__seg"
            style={{ flexGrow: summary[key], background: `var(--${tone})` }}
          />
        ))}
      </div>

      <ul className="mood__legend">
        {SEGMENTS.map(({ key, label, tone }) => {
          const share = summary.total ? Math.round((summary[key] / summary.total) * 100) : 0;
          return (
            <li key={key}>
              <span className="dot" style={{ background: `var(--${tone})` }} aria-hidden="true" />
              {label} <strong>{summary[key]}</strong> <span className="muted">{share}%</span>
            </li>
          );
        })}
      </ul>

      <dl className="stats">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
