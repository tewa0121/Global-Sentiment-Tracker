import { DownloadIcon } from './Icons.jsx';

export default function FilterBar({ topics, topic, onTopic, range, onRange, active, onClear, onExport, exportCount }) {
  const names = topics.map((t) => t.keyword);
  if (topic && !names.some((n) => n.toLowerCase() === topic.toLowerCase())) names.unshift(topic);

  return (
    <section className="filters" aria-label="Filters">
      <label className="field">
        <span className="field__label">Topic</span>
        <select className="input" value={topic} onChange={(e) => onTopic(e.target.value)}>
          <option value="">All topics</option>
          {names.map((name) => (
            <option key={name} value={name}>
              #{name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field__label">From</span>
        <input
          className="input"
          type="date"
          value={range.from}
          max={range.to || undefined}
          onChange={(e) => onRange({ ...range, from: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field__label">To</span>
        <input
          className="input"
          type="date"
          value={range.to}
          min={range.from || undefined}
          onChange={(e) => onRange({ ...range, to: e.target.value })}
        />
      </label>
      {active && (
        <button type="button" className="btn btn--quiet" onClick={onClear}>
          Clear filters
        </button>
      )}
      <button
        type="button"
        className="btn btn--ghost filters__export"
        onClick={onExport}
        disabled={exportCount === 0}
      >
        <DownloadIcon />
        Export {exportCount} {exportCount === 1 ? 'post' : 'posts'} as CSV
      </button>
    </section>
  );
}
