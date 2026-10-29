import { useState } from 'react';
import { createPost, describeError } from '../lib/api.js';
import { signed } from '../lib/format.js';
import { toneOf } from '../lib/palette.js';
import { CloseIcon, PinIcon } from './Icons.jsx';

const EXAMPLES = [
  { label: 'Positive', text: 'The new launch is fantastic and the team did an amazing job' },
  { label: 'Negative', text: 'The update is a disaster, slow and full of annoying bugs' },
  { label: 'Neutral', text: 'The meeting is scheduled for Tuesday afternoon' },
];

export default function Composer({ topics, pin, pinning, onStartPin, onCancelPin, onClearPin, onPosted }) {
  const [keyword, setKeyword] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const clean = text.trim();
    if (!clean || busy) return;

    setBusy(true);
    setError('');
    setResult(null);
    try {
      const payload = { post_text: clean };
      if (keyword.trim()) payload.keyword = keyword.trim();
      if (pin) {
        payload.latitude = pin.latitude;
        payload.longitude = pin.longitude;
      }
      const saved = await createPost(payload);
      setResult(saved);
      setText('');
      onPosted(saved);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  function edit(value) {
    setText(value);
    if (result) setResult(null);
    if (error) setError('');
  }

  const tone = result ? toneOf(result.sentiment_label) : 'neu';

  return (
    <form className="panel composer" onSubmit={submit} aria-labelledby="composer-title">
      <h2 id="composer-title" className="panel__title">
        Score a post
      </h2>
      <p className="panel__sub">Write something and see how it reads. It joins the feed, the charts and the map.</p>

      <label className="field">
        <span className="field__label">Topic</span>
        <input
          className="input"
          type="text"
          list="topic-suggestions"
          placeholder="General"
          maxLength={100}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <datalist id="topic-suggestions">
          {topics.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>

      <label className="field">
        <span className="field__label">Post</span>
        <textarea
          className="input"
          rows={3}
          maxLength={5000}
          placeholder="What are people saying?"
          value={text}
          onChange={(e) => edit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form.requestSubmit();
          }}
        />
      </label>

      <div className="composer__examples">
        <span className="muted">Try an example:</span>
        {EXAMPLES.map((example) => (
          <button key={example.label} type="button" className="chip" onClick={() => edit(example.text)}>
            {example.label}
          </button>
        ))}
      </div>

      <div className="composer__location">
        {pin ? (
          <>
            <span className="composer__coords">
              <PinIcon /> {pin.latitude.toFixed(2)}, {pin.longitude.toFixed(2)}
            </span>
            <button type="button" className="btn btn--quiet" onClick={onClearPin}>
              <CloseIcon /> Remove location
            </button>
          </>
        ) : pinning ? (
          <>
            <span className="composer__coords">Click the map to place this post</span>
            <button type="button" className="btn btn--quiet" onClick={onCancelPin}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={onStartPin}>
            <PinIcon /> Pin on map
          </button>
        )}
      </div>

      <div className="composer__actions">
        <button type="submit" className="btn btn--primary" disabled={busy || !text.trim()}>
          {busy ? 'Scoring…' : 'Score post'}
        </button>
        <span className="muted composer__hint">Ctrl or ⌘ + Enter</span>
      </div>

      <div aria-live="polite">
        {result && (
          <p className="result">
            <span className={`badge badge--${tone}`}>
              {result.sentiment_label} {signed(result.sentiment_score)}
            </span>
            Post scored and added to the feed.
          </p>
        )}
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
