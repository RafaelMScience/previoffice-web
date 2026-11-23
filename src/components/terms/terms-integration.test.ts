import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Dashboard Layout Integration: Terms Consent and Inactivity Lock Screen', () => {
  const layoutPath = path.resolve('src/app/(dashboard)/layout.tsx');
  assert.ok(fs.existsSync(layoutPath), 'layout.tsx must exist');

  const content = fs.readFileSync(layoutPath, 'utf-8');

  // Must import TermsConsentModal
  assert.match(content, /TermsConsentModal/);

  // Must import InactivityLockScreen and useInactivityTracker
  assert.match(content, /InactivityLockScreen/);
  assert.match(content, /useInactivityTracker/);

  // Must render TermsConsentModal
  assert.match(content, /<TermsConsentModal/);

  // Must render InactivityLockScreen
  assert.match(content, /<InactivityLockScreen/);

  // Must wire safe sign out to handleLogout
  assert.match(content, /onSignOut=\{handleLogout\}/);
});
