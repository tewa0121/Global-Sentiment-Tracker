import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function SentimentMap({ posts }) {
  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {posts.map((p) => (
          p.latitude && p.longitude ? (
            <Marker key={p.id} position={[parseFloat(p.latitude), parseFloat(p.longitude)]}>
              <Popup>
                <strong>#{p.keyword}</strong><br />
                {p.post_text}<br />
                <em>Score: {p.sentiment_score} ({p.sentiment_label})</em>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}