import { useNow } from '../hooks/useNow.js';
import { timeAgo } from '../lib/format.js';
import { LogoMark, MoonIcon, SunIcon } from './Icons.jsx';

function StatusPill({ status, updatedAt }) {
  const now = useNow(1000);
  let text = 'Connecting…';
  let extra = '';
  if (status === 'live') {
    text = 'Live';
    if (updatedAt) extra = `, updated ${timeAgo(new Date(updatedAt), now)}`;
  }
  if (status === 'offline') {
    text = 'Offline';
    extra = ', retrying';
  }
  return (
    <span className={`status status--${status}`} role="status">
      <span className="status__dot" aria-hidden="true" />
      <span>
        {text}
        <span className="status__extra">{extra}</span>
      </span>
    </span>
  );
}

export default function Header({ status, updatedAt, theme, onToggleTheme }) {
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__mark">
          <LogoMark />
        </span>
        <span className="brand__name">Global Sentiment Tracker</span>
      </div>
      <div className="topbar__actions">
        <StatusPill status={status} updatedAt={updatedAt} />
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${next} theme`}
          title={`Switch to ${next} theme`}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
