import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_INACTIVITY_TIMEOUT_MS,
  INACTIVITY_LISTENED_EVENTS,
  calculateRemainingTime,
  shouldTriggerLock,
} from './inactivity-tracker.ts';

test('Inactivity Tracker: Configuration and Event Detection', () => {
  // 1. Must be exactly 45 minutes
  assert.equal(DEFAULT_INACTIVITY_TIMEOUT_MS, 45 * 60 * 1000);
  assert.equal(DEFAULT_INACTIVITY_TIMEOUT_MS, 2700000);

  // 2. Must include mouse wheel and scrolling events as requested by user
  assert.ok(INACTIVITY_LISTENED_EVENTS.includes('wheel'), 'Must listen to wheel');
  assert.ok(INACTIVITY_LISTENED_EVENTS.includes('scroll'), 'Must listen to scroll');
  assert.ok(INACTIVITY_LISTENED_EVENTS.includes('mousemove'), 'Must listen to mousemove');
  assert.ok(INACTIVITY_LISTENED_EVENTS.includes('keydown'), 'Must listen to keydown');
  assert.ok(INACTIVITY_LISTENED_EVENTS.includes('mousedown'), 'Must listen to mousedown');
  assert.ok(INACTIVITY_LISTENED_EVENTS.includes('touchstart'), 'Must listen to touchstart');
  assert.ok(INACTIVITY_LISTENED_EVENTS.includes('touchmove'), 'Must listen to touchmove');

  // 3. Time calculation & lock triggering logic
  const now = Date.now();
  const recentActivity = now - 10 * 60 * 1000; // 10 minutes ago
  assert.equal(shouldTriggerLock(recentActivity, DEFAULT_INACTIVITY_TIMEOUT_MS, now), false);

  const expiredActivity = now - 46 * 60 * 1000; // 46 minutes ago
  assert.equal(shouldTriggerLock(expiredActivity, DEFAULT_INACTIVITY_TIMEOUT_MS, now), true);

  const remaining = calculateRemainingTime(recentActivity, DEFAULT_INACTIVITY_TIMEOUT_MS, now);
  assert.equal(remaining, 35 * 60 * 1000);
});
