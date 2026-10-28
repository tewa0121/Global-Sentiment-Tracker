const Sentiment = require('sentiment');
const analyzer = new Sentiment();

const MAX_TEXT_LENGTH = 5000;

/**
 * Deterministic English-language lexicon analysis. The sentiment package is
 * English-oriented; do not treat this as multilingual or production-grade NLP.
 * Labels are always derived from the calculated score, never accepted from clients.
 */
function analyzeText(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Text must be a string');
  }
  const normalized = text.trim();
  if (!normalized) throw new TypeError('Text must not be empty');
  if (normalized.length > MAX_TEXT_LENGTH) {
    throw new RangeError(`Text must be ${MAX_TEXT_LENGTH} characters or fewer`);
  }

  const result = analyzer.analyze(normalized);
  const score = Number(result.score);
  const label = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';

  return { score, label };
}

module.exports = { analyzeText, MAX_TEXT_LENGTH };
