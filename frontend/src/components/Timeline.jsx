import { useId, useMemo, useState } from 'react';
import { useElementSize } from '../hooks/useElementSize.js';
import { clip, signed } from '../lib/format.js';
import { toneOf } from '../lib/palette.js';
import { buildSeries } from '../lib/stats.js';

const M = { top: 14, right: 14, bottom: 30, left: 38 };

function formatTime(date, withSeconds) {
  if (!date) return '';
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
  });
}

export default function Timeline({ posts }) {
  const series = useMemo(() => buildSeries(posts), [posts]);
  const [ref, { width, height: HEIGHT }] = useElementSize();
  const [hover, setHover] = useState(null);
  const gradientId = `area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const n = series.length;
  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = HEIGHT - M.top - M.bottom;
  const bound = Math.ceil(Math.max(3, ...series.map((s) => Math.max(Math.abs(s.score), Math.abs(s.avg)))));
  const x = (i) => M.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const y = (v) => M.top + (1 - (v + bound) / (2 * bound)) * innerH;

  const linePath = series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.avg).toFixed(1)}`).join('');
  const areaPath = n > 1 ? `${linePath}L${x(n - 1).toFixed(1)},${y(0).toFixed(1)}L${x(0).toFixed(1)},${y(0).toFixed(1)}Z` : '';

  const span = n > 1 && series[0].date && series[n - 1].date ? series[n - 1].date - series[0].date : 0;
  const withSeconds = span < 30 * 60 * 1000;
  const ticks = n > 2 ? [0, Math.floor((n - 1) / 2), n - 1] : n === 2 ? [0, 1] : n === 1 ? [0] : [];

  function onMove(event) {
    if (!n) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const index = n > 1 ? Math.round(((event.clientX - rect.left - M.left) / innerW) * (n - 1)) : 0;
    setHover(Math.min(n - 1, Math.max(0, index)));
  }

  const active = hover !== null ? series[hover] : null;
  const latest = n ? series[n - 1].avg : 0;

  return (
    <section className="panel panel--fill" aria-labelledby="timeline-title">
      <div className="panel__head">
        <h2 id="timeline-title" className="panel__title">
          Mood over time
        </h2>
        <p className="panel__sub">Each dot is one post. The line is the average of the last five.</p>
      </div>
      <div className="panel__body chart-wrap">
        <div className="chart" ref={ref}>
          {n < 2 || width === 0 || HEIGHT === 0 ? (
            <p className="empty">Not enough posts yet to draw a trend.</p>
          ) : (
            <>
              <svg
                width={width}
                height={HEIGHT}
                role="img"
                aria-label={`Sentiment of the last ${n} posts. The latest rolling average is ${signed(latest, 1)}.`}
                onPointerMove={onMove}
                onPointerLeave={() => setHover(null)}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {[bound, 0, -bound].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={M.left}
                      x2={width - M.right}
                      y1={y(tick)}
                      y2={y(tick)}
                      className={tick === 0 ? 'chart__zero' : 'chart__grid'}
                    />
                    <text x={M.left - 8} y={y(tick)} className="chart__tick" textAnchor="end" dominantBaseline="middle">
                      {signed(tick)}
                    </text>
                  </g>
                ))}

                <path d={areaPath} fill={`url(#${gradientId})`} />
                <path d={linePath} className="chart__line" />

                {series.map((s, i) => (
                  <circle
                    key={s.id}
                    cx={x(i)}
                    cy={y(s.score)}
                    r={hover === i ? 5 : 3.2}
                    style={{ fill: `var(--${toneOf(s.label)})` }}
                    className="chart__dot"
                  />
                ))}

                {active && <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={HEIGHT - M.bottom} className="chart__cursor" />}

                {ticks.map((i) => (
                  <text
                    key={i}
                    x={x(i)}
                    y={HEIGHT - 8}
                    className="chart__tick"
                    textAnchor={i === 0 && n > 1 ? 'start' : i === n - 1 && n > 1 ? 'end' : 'middle'}
                  >
                    {formatTime(series[i].date, withSeconds)}
                  </text>
                ))}
              </svg>

              {active && (
                <div
                  className="chart__tip"
                  style={{ left: Math.min(Math.max(x(hover), 120), width - 120) }}
                  role="presentation"
                >
                  <strong>
                    #{active.keyword} <span style={{ color: `var(--${toneOf(active.label)}-ink)` }}>{signed(active.score)}</span>
                  </strong>
                  <span>{clip(active.text, 80)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
