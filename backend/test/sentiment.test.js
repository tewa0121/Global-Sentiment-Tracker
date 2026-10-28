const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeText, MAX_TEXT_LENGTH } = require('../utils/sentiment');

test('analyzeText returns a positive label for positive English text', () => {
  const result = analyzeText('I love this excellent product');
  assert.equal(result.label, 'positive');
  assert.ok(result.score > 0);
});

test('analyzeText returns a negative label for negative English text', () => {
  const result = analyzeText('This is a terrible and horrible failure');
  assert.equal(result.label, 'negative');
  assert.ok(result.score < 0);
});

test('analyzeText returns neutral for text without sentiment terms', () => {
  const result = analyzeText('The record was added on Tuesday');
  assert.equal(result.label, 'neutral');
  assert.equal(result.score, 0);
});

test('analyzeText rejects empty and non-string inputs', () => {
  assert.throws(() => analyzeText('  '), /must not be empty/);
  assert.throws(() => analyzeText(null), /must be a string/);
});

test('analyzeText rejects text above the documented limit', () => {
  assert.throws(() => analyzeText('a'.repeat(MAX_TEXT_LENGTH + 1)), /characters or fewer/);
});
