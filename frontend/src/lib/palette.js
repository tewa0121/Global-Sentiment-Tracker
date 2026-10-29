// Colours that Leaflet needs as real strings (CSS variables can't be used in
// map paths). Keep in sync with the tokens in index.css.
export const SENTIMENT_COLORS = {
  dark: { positive: '#3ddbb4', negative: '#ff7a6b', neutral: '#8b9bb8', accent: '#7ea6ff' },
  light: { positive: '#12a383', negative: '#e24b3c', neutral: '#7886a1', accent: '#3a5fd9' },
};

export const TONE = { positive: 'pos', negative: 'neg', neutral: 'neu' };

export function toneOf(label) {
  return TONE[label] || 'neu';
}
