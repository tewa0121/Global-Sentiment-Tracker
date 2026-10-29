/** MySQL returns "YYYY-MM-DD HH:MM:SS". Safari rejects the space, so normalise it. */
export function parseDate(value) {
  if (!value) return null;
  const text = String(value);
  const date = new Date(text.includes('T') ? text : text.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function timeAgo(date, now = Date.now()) {
  if (!date) return '';
  const seconds = Math.max(0, Math.round((now - date.getTime()) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** +3, −2, 0 (with a real minus sign). */
export function signed(value, digits = 0) {
  const n = Number(value) || 0;
  const abs = Math.abs(n).toFixed(digits);
  if (Number(abs) === 0) return digits ? (0).toFixed(digits) : '0';
  return `${n > 0 ? '+' : '−'}${abs}`;
}

export function clip(text, max = 90) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}
