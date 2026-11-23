import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Inactivity Lock Screen: Component Structure & Accessibility Contract', () => {
  const filePath = path.resolve('src/components/lock-screen/inactivity-lock-screen.tsx');
  assert.ok(fs.existsSync(filePath), 'Component file must exist');

  const content = fs.readFileSync(filePath, 'utf-8');

  // Must export InactivityLockScreen component
  assert.match(content, /export function InactivityLockScreen/);

  // Must have role="dialog" and aria-modal="true" for WCAG compliance
  assert.match(content, /role="dialog"/);
  assert.match(content, /aria-modal="true"/);

  // Must have 45-minute badge
  assert.match(content, /45 min/);

  // Must have "Continuar Atendimento" button
  assert.match(content, /Continuar Atendimento/);

  // Must have safe sign-out option
  assert.match(content, /Trocar de Usuário \/ Sair/);

  // Must handle Enter key for keyboard accessibility
  assert.match(content, /e\.key === 'Enter'/);
});
