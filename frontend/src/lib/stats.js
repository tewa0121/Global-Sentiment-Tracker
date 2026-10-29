import { parseDate, signed } from './format.js';

export function hasLocation(post) {
  return (
    post.latitude != null &&
    post.longitude != null &&
    Number.isFinite(Number(post.latitude)) &&
    Number.isFinite(Number(post.longitude))
  );
}

export function summarize(posts) {
  const total = posts.length;
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  let located = 0;
  let sum = 0;
  for (const post of posts) {
    if (post.sentiment_label === 'positive') positive += 1;
    else if (post.sentiment_label === 'negative') negative += 1;
    else neutral += 1;
    if (hasLocation(post)) located += 1;
    sum += Number(post.sentiment_score) || 0;
  }
  // Net sentiment: share of positive posts minus share of negative posts, in points.
  const net = total ? Math.round(((positive - negative) / total) * 100) : 0;
  return { total, positive, negative, neutral, located, avg: total ? sum / total : 0, net };
}

/** Plain-language read of the current mood for the page headline. */
export function describeMood({ total, net, neutral, positive, negative }, subject = 'Conversation') {
  if (!total) {
    return { headline: 'No posts to show yet', detail: '' };
  }
  const neutralShare = neutral / total;
  let headline;
  if (neutralShare >= 0.6) headline = `${subject} is mostly neutral`;
  else if (net >= 40) headline = `${subject} is strongly positive`;
  else if (net >= 15) headline = `${subject} is leaning positive`;
  else if (net <= -40) headline = `${subject} is strongly negative`;
  else if (net <= -15) headline = `${subject} is leaning negative`;
  else headline = `${subject} is evenly split`;

  let detail;
  if (positive === negative) detail = 'Positive and negative posts are balanced.';
  else if (net > 0) detail = `Positive posts outnumber negative ones by ${Math.abs(net)} points.`;
  else detail = `Negative posts outnumber positive ones by ${Math.abs(net)} points.`;
  return { headline, detail };
}

export function groupByKeyword(posts) {
  const groups = new Map();
  for (const post of posts) {
    const keyword = post.keyword || 'General';
    const key = keyword.toLowerCase();
    let group = groups.get(key);
    if (!group) {
      group = { keyword, total: 0, sum: 0, positive: 0, negative: 0, neutral: 0 };
      groups.set(key, group);
    }
    group.total += 1;
    group.sum += Number(post.sentiment_score) || 0;
    if (post.sentiment_label === 'positive') group.positive += 1;
    else if (post.sentiment_label === 'negative') group.negative += 1;
    else group.neutral += 1;
  }
  return [...groups.values()]
    .map((group) => ({ ...group, avg: group.sum / group.total }))
    .sort((a, b) => b.total - a.total || a.keyword.localeCompare(b.keyword));
}

/** Oldest-to-newest points for the timeline, with a rolling average. */
export function buildSeries(posts, max = 40, windowSize = 5) {
  const sorted = posts
    .map((post) => ({ post, time: parseDate(post.created_at)?.getTime() ?? 0 }))
    .sort((a, b) => a.time - b.time || a.post.id - b.post.id)
    .slice(-max);

  return sorted.map(({ post, time }, index) => {
    const from = Math.max(0, index - windowSize + 1);
    const windowItems = sorted.slice(from, index + 1);
    const avg =
      windowItems.reduce((sum, item) => sum + (Number(item.post.sentiment_score) || 0), 0) /
      windowItems.length;
    return {
      id: post.id,
      score: Number(post.sentiment_score) || 0,
      avg,
      label: post.sentiment_label,
      keyword: post.keyword || 'General',
      text: post.post_text,
      date: time ? new Date(time) : null,
    };
  });
}

export function scoreLabel(post) {
  return `${post.sentiment_label} ${signed(post.sentiment_score)}`;
}
