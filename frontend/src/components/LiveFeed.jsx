import { useNow } from '../hooks/useNow.js';
import { parseDate, signed, timeAgo } from '../lib/format.js';
import { toneOf } from '../lib/palette.js';
import { hasLocation } from '../lib/stats.js';
import { PinIcon } from './Icons.jsx';

const FEED_LIMIT = 30;

function FeedItem({ post, fresh, now, onLocate }) {
  const tone = toneOf(post.sentiment_label);
  const located = hasLocation(post);
  const Tag = located ? 'button' : 'div';
  const props = located
    ? { type: 'button', onClick: () => onLocate(post), title: 'Show on the map' }
    : {};

  return (
    <li>
      <Tag
        className={`feed__item${located ? ' feed__item--link' : ''}${fresh ? ' is-new' : ''}`}
        style={{ '--tone': `var(--${tone})` }}
        {...props}
      >
        <span className="feed__meta">
          <span className="feed__topic">#{post.keyword}</span>
          <time dateTime={parseDate(post.created_at)?.toISOString()}>
            {timeAgo(parseDate(post.created_at), now)}
          </time>
          {located && (
            <span className="feed__pin" aria-label="Has a location">
              <PinIcon size={13} />
            </span>
          )}
        </span>
        <span className="feed__text">{post.post_text}</span>
        <span className={`badge badge--${tone}`}>
          {post.sentiment_label} {signed(post.sentiment_score)}
        </span>
      </Tag>
    </li>
  );
}

export default function LiveFeed({ posts, freshIds, onLocate }) {
  const now = useNow(1000);
  const shown = posts.slice(0, FEED_LIMIT);

  return (
    <section className="panel feed-panel" aria-labelledby="feed-title">
      <div className="panel__head">
        <h2 id="feed-title" className="panel__title">
          Live feed
        </h2>
        <p className="panel__sub">
          {posts.length > FEED_LIMIT
            ? `Latest ${FEED_LIMIT} of ${posts.length} posts. Select one with a pin to find it on the map.`
            : 'Newest first. Select a post with a pin to find it on the map.'}
        </p>
      </div>
      {shown.length === 0 ? (
        <p className="empty">No posts match these filters.</p>
      ) : (
        <ul className="feed">
          {shown.map((post) => (
            <FeedItem
              key={post.id}
              post={post}
              fresh={freshIds.has(post.id)}
              now={now}
              onLocate={onLocate}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
