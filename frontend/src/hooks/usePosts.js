import { useCallback, useEffect, useRef, useState } from 'react';
import { describeError, fetchPosts, isCanceled } from '../lib/api.js';

const POLL_MS = 3000;
const FRESH_MS = 4500;

/**
 * Polls the API, pausing while the tab is hidden. Exposes the connection
 * status and the ids of posts that arrived since the first load so the UI can
 * highlight them briefly.
 */
export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('connecting'); // connecting | live | offline
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [freshIds, setFreshIds] = useState(() => new Set());

  const seen = useRef(null);
  const inflight = useRef(null);
  const timers = useRef(new Set());

  const load = useCallback(async (force = false) => {
    if (inflight.current) {
      if (!force) return;
      inflight.current.abort();
    }
    const controller = new AbortController();
    inflight.current = controller;

    try {
      const data = await fetchPosts({ signal: controller.signal });
      if (!Array.isArray(data)) throw new Error('Unexpected response from the API');

      const added = seen.current ? data.filter((p) => !seen.current.has(p.id)).map((p) => p.id) : [];
      seen.current = new Set(data.map((p) => p.id));

      setPosts(data);
      setStatus('live');
      setError('');
      setUpdatedAt(Date.now());

      if (added.length) {
        setFreshIds((prev) => new Set([...prev, ...added]));
        const timer = setTimeout(() => {
          timers.current.delete(timer);
          setFreshIds((prev) => {
            const next = new Set(prev);
            added.forEach((id) => next.delete(id));
            return next;
          });
        }, FRESH_MS);
        timers.current.add(timer);
      }
    } catch (err) {
      if (isCanceled(err)) return;
      setStatus('offline');
      setError(describeError(err));
    } finally {
      if (inflight.current === controller) inflight.current = null;
    }
  }, []);

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) load();
    };
    tick();
    const interval = setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    const pending = timers.current;
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
      inflight.current?.abort();
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, [load]);

  return { posts, status, error, updatedAt, freshIds, refresh: () => load(true) };
}
