import { useMemo, useState } from 'react';
import './App.css';
import Composer from './components/Composer.jsx';
import FilterBar from './components/FilterBar.jsx';
import Header from './components/Header.jsx';
import LiveFeed from './components/LiveFeed.jsx';
import MoodHero from './components/MoodHero.jsx';
import SentimentMap from './components/SentimentMap.jsx';
import Timeline from './components/Timeline.jsx';
import TopicBoard from './components/TopicBoard.jsx';
import { usePosts } from './hooks/usePosts.js';
import { useTheme } from './hooks/useTheme.js';
import { API_BASE } from './lib/api.js';
import { downloadCsv } from './lib/csv.js';
import { parseDate } from './lib/format.js';
import { groupByKeyword, summarize } from './lib/stats.js';

const NO_RANGE = { from: '', to: '' };

export default function App() {
  const { posts, status, error, updatedAt, freshIds, refresh } = usePosts();
  const { theme, toggle } = useTheme();

  const [topic, setTopic] = useState('');
  const [range, setRange] = useState(NO_RANGE);
  const [pin, setPin] = useState(null);
  const [pinning, setPinning] = useState(false);
  const [focus, setFocus] = useState(null);

  // Date filter first. The topic board uses this list so you can still compare
  // topics while one of them is selected.
  const inRange = useMemo(() => {
    const start = range.from ? new Date(`${range.from}T00:00:00`) : null;
    const end = range.to ? new Date(`${range.to}T23:59:59.999`) : null;
    if (!start && !end) return posts;
    return posts.filter((post) => {
      const date = parseDate(post.created_at);
      if (!date) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  }, [posts, range]);

  const visible = useMemo(() => {
    if (!topic) return inRange;
    const wanted = topic.toLowerCase();
    return inRange.filter((post) => (post.keyword || 'General').toLowerCase() === wanted);
  }, [inRange, topic]);

  const topics = useMemo(() => groupByKeyword(inRange), [inRange]);
  const summary = useMemo(() => summarize(visible), [visible]);

  const filtersActive = Boolean(topic || range.from || range.to);
  const loading = status === 'connecting' && posts.length === 0;

  function clearFilters() {
    setTopic('');
    setRange(NO_RANGE);
  }

  function handlePosted() {
    setPin(null);
    setPinning(false);
    refresh();
  }

  function locate(post) {
    setFocus({
      id: post.id,
      latitude: Number(post.latitude),
      longitude: Number(post.longitude),
      nonce: Date.now(),
    });
  }

  function exportCsv() {
    downloadCsv(visible, `sentiment-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return (
    <div className="app">
      <Header status={status} updatedAt={updatedAt} theme={theme} onToggleTheme={toggle} />

      {status === 'offline' && (
        <div className="banner" role="alert">
          <strong>{error}</strong> Start the backend with <code>npm start</code> in the backend folder and make sure
          MySQL is running. This page keeps retrying every few seconds.
        </div>
      )}

      <main>
        <div className="hero">
          <MoodHero summary={summary} topicCount={topics.length} topic={topic} loading={loading} />
          <Composer
            topics={topics.map((t) => t.keyword)}
            pin={pin}
            pinning={pinning}
            onStartPin={() => setPinning(true)}
            onCancelPin={() => setPinning(false)}
            onClearPin={() => setPin(null)}
            onPosted={handlePosted}
          />
        </div>

        <FilterBar
          topics={topics}
          topic={topic}
          onTopic={setTopic}
          range={range}
          onRange={setRange}
          active={filtersActive}
          onClear={clearFilters}
          onExport={exportCsv}
          exportCount={visible.length}
        />

        <div className="grid grid--map">
          <SentimentMap
            posts={visible}
            summary={summary}
            freshIds={freshIds}
            theme={theme}
            pin={pin}
            pinning={pinning}
            onPick={(coords) => {
              setPin(coords);
              setPinning(false);
            }}
            onCancelPin={() => setPinning(false)}
            focus={focus}
          />
          <LiveFeed posts={visible} freshIds={freshIds} onLocate={locate} />
        </div>

        <div className="grid grid--insights">
          <Timeline posts={visible} />
          <TopicBoard topics={topics} selected={topic} onSelect={setTopic} />
        </div>
      </main>

      <footer className="footer">
        <p>
          Scores come from an English word list (AFINN), so treat them as a quick signal rather than a verdict. The
          dashboard shows the latest 100 posts from <code>{API_BASE}</code>.
        </p>
      </footer>
    </div>
  );
}
