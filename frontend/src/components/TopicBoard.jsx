import { signed } from '../lib/format.js';

const MAX_TOPICS = 8;

export default function TopicBoard({ topics, selected, onSelect }) {
  const shown = topics.slice(0, MAX_TOPICS);
  const maxAbs = Math.max(1, ...shown.map((t) => Math.abs(t.avg)));

  return (
    <section className="panel" aria-labelledby="topics-title">
      <div className="panel__head">
        <h2 id="topics-title" className="panel__title">
          Topics
        </h2>
        <p className="panel__sub">Average score per topic. Select one to filter the whole dashboard.</p>
      </div>
      <div className="panel__body">
        {shown.length === 0 ? (
          <p className="empty">Topics appear here once posts arrive.</p>
        ) : (
          <ul className="topics">
            {shown.map((topic) => {
              const isSelected = selected.toLowerCase() === topic.keyword.toLowerCase();
              const tone = topic.avg > 0.05 ? 'pos' : topic.avg < -0.05 ? 'neg' : 'neu';
              const half = (Math.abs(topic.avg) / maxAbs) * 50;
              return (
                <li key={topic.keyword}>
                  <button
                    type="button"
                    className="topic"
                    aria-pressed={isSelected}
                    onClick={() => onSelect(isSelected ? '' : topic.keyword)}
                  >
                    <span className="topic__name">#{topic.keyword}</span>
                    <span className="topic__track" aria-hidden="true">
                      <span
                        className="topic__fill"
                        style={{
                          background: `var(--${tone})`,
                          width: `${Math.max(half, 1.5)}%`,
                          left: topic.avg >= 0 ? '50%' : `${50 - Math.max(half, 1.5)}%`,
                        }}
                      />
                    </span>
                    <span className="topic__value">
                      <strong>{signed(topic.avg, 1)}</strong>
                      <span className="muted">
                        {topic.total} {topic.total === 1 ? 'post' : 'posts'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
