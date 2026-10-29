import { useEffect, useMemo } from 'react';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { SENTIMENT_COLORS, toneOf } from '../lib/palette.js';
import { clip, signed } from '../lib/format.js';
import { hasLocation } from '../lib/stats.js';
import { CloseIcon } from './Icons.jsx';

// OpenStreetMap's public tiles need no API key. In dark theme they are
// darkened with a CSS filter (see .map-panel--dim in App.css).
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function PinPicker({ active, onPick }) {
  useMapEvents({
    click(event) {
      if (!active) return;
      const { lat, lng } = event.latlng.wrap();
      onPick({ latitude: Number(lat.toFixed(5)), longitude: Number(lng.toFixed(5)) });
    },
  });
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.latitude, target.longitude], Math.max(map.getZoom(), 4), { duration: 1.1 });
  }, [map, target]);
  return null;
}

export default function SentimentMap({ posts, summary, freshIds, theme, pin, pinning, onPick, onCancelPin, focus }) {
  const colors = SENTIMENT_COLORS[theme];
  const located = useMemo(() => posts.filter(hasLocation).slice().reverse(), [posts]);
  const colorFor = (label) => colors[label] || colors.neutral;

  return (
    <section
      className={`panel map-panel${pinning ? ' map-panel--picking' : ''}${theme === 'dark' ? ' map-panel--dim' : ''}`}
      aria-label="Map of where posts were made"
    >
      <MapContainer
        center={[24, 10]}
        zoom={2}
        minZoom={2}
        maxBounds={[[-85, -200], [85, 200]]}
        maxBoundsViscosity={0.8}
        worldCopyJump
        zoomControl={false}
        className="map"
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
        <ZoomControl position="topright" />
        <PinPicker active={pinning} onPick={onPick} />
        <FlyTo target={focus} />

        {located.map((post) => {
          const color = colorFor(post.sentiment_label);
          const radius = 5 + Math.min(Math.abs(Number(post.sentiment_score) || 0), 8) * 0.9;
          return (
            <CircleMarker
              key={post.id}
              center={[Number(post.latitude), Number(post.longitude)]}
              radius={radius}
              pathOptions={{ color, weight: 1.5, fillColor: color, fillOpacity: 0.5 }}
            >
              <Popup>
                <div className="popup">
                  <strong>#{post.keyword}</strong>
                  <p>{clip(post.post_text, 240)}</p>
                  <span className={`badge badge--${toneOf(post.sentiment_label)}`}>
                    {post.sentiment_label} {signed(post.sentiment_score)}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {located
          .filter((post) => freshIds.has(post.id))
          .map((post) => (
            <CircleMarker
              key={`ping-${post.id}`}
              center={[Number(post.latitude), Number(post.longitude)]}
              radius={9}
              className="ping"
              interactive={false}
              pathOptions={{ color: colorFor(post.sentiment_label), fill: false, weight: 2 }}
            />
          ))}

        {focus && (
          <CircleMarker
            key={`focus-${focus.nonce}`}
            center={[focus.latitude, focus.longitude]}
            radius={11}
            className="ping"
            interactive={false}
            pathOptions={{ color: colors.accent, fill: false, weight: 2 }}
          />
        )}

        {pin && (
          <CircleMarker
            center={[pin.latitude, pin.longitude]}
            radius={9}
            interactive={false}
            pathOptions={{ color: colors.accent, weight: 2, dashArray: '3 4', fillColor: colors.accent, fillOpacity: 0.25 }}
          />
        )}
      </MapContainer>

      <div className="map-overlay map-overlay--top">
        <div className="map-pill">
          <h2 className="panel__title">Where people are posting</h2>
          <p className="panel__sub">
            {summary.located} of {summary.total} posts have a location
          </p>
        </div>
      </div>

      {pinning && (
        <div className="map-hint" role="status">
          Click anywhere on the map to place your post
          <button type="button" className="btn btn--quiet" onClick={onCancelPin}>
            <CloseIcon /> Cancel
          </button>
        </div>
      )}

      {!pinning && summary.total > 0 && summary.located === 0 && (
        <div className="map-empty">
          <p>
            <strong>No posts with a location yet.</strong>
            <br />
            Use “Pin on map” when you score a post, or run npm run generate for demo data.
          </p>
        </div>
      )}

      <ul className="map-pill map-legend">
        {[
          ['positive', 'Positive'],
          ['neutral', 'Neutral'],
          ['negative', 'Negative'],
        ].map(([key, label]) => (
          <li key={key}>
            <span className="dot" style={{ background: `var(--${toneOf(key)})` }} aria-hidden="true" />
            {label}
          </li>
        ))}
        <li className="muted">Bigger dot = stronger score</li>
      </ul>
    </section>
  );
}