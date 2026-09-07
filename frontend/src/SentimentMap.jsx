import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export default function SentimentMap({ posts }) {
  // Fallback map center (London)
  const center = [51.505, -0.09];

  // Map sentiment labels to marker colors
  const getColor = (label) => {
    switch (label?.toLowerCase()) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={2} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {posts.map((post, idx) => {
          // Fallback random coordinates if latitude/longitude aren't present
          const lat = post.latitude || (Math.random() * 140 - 70);
          const lng = post.longitude || (Math.random() * 360 - 180);

          return (
            <CircleMarker
              key={post.id || idx}
              center={[lat, lng]}
              radius={8}
              fillColor={getColor(post.sentiment_label)}
              color="#ffffff"
              weight={1.5}
              fillOpacity={0.8}
            >
              <Popup>
                <div>
                  <strong>#{post.keyword}</strong>
                  <p style={{ margin: '5px 0' }}>{post.post_text}</p>
                  <span style={{ color: getColor(post.sentiment_label), fontWeight: 'bold' }}>
                    {post.sentiment_label?.toUpperCase()} ({post.sentiment_score})
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}