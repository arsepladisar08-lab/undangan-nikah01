import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTimeRemaining, formatTwoDigits } from './countdown';

test('calculates correct days, hours, minutes, and seconds', () => {
  const now = 1000000000000;
  // 2 days + 3 hours + 4 minutes + 5 seconds in milliseconds
  const diff = (2 * 24 * 3600 + 3 * 3600 + 4 * 60 + 5) * 1000;
  const target = now + diff;

  const result = calculateTimeRemaining(target, now);
  assert.equal(result.days, 2);
  assert.equal(result.hours, 3);
  assert.equal(result.minutes, 4);
  assert.equal(result.seconds, 5);
  assert.equal(result.isExpired, false);
});

test('handles expired target time gracefully', () => {
  const now = 2000000000000;
  const target = 1000000000000;

  const result = calculateTimeRemaining(target, now);
  assert.equal(result.days, 0);
  assert.equal(result.hours, 0);
  assert.equal(result.minutes, 0);
  assert.equal(result.seconds, 0);
  assert.equal(result.isExpired, true);
});

test('formatTwoDigits formats single digit with leading zero', () => {
  assert.equal(formatTwoDigits(7), '07');
  assert.equal(formatTwoDigits(12), '12');
  assert.equal(formatTwoDigits(0), '00');
});
