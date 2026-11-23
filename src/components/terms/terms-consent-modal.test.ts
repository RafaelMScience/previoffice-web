import test from 'node:test';
import assert from 'node:assert/strict';
import { TERMS_OF_RESPONSIBILITY, CURRENT_TERMS_VERSION } from './terms-content.ts';

test('LGPD Terms Content & Legal Clauses Verification', () => {
  assert.equal(CURRENT_TERMS_VERSION, '1.0');
  assert.ok(TERMS_OF_RESPONSIBILITY.length >= 4);

  // Clause 1: Password security and non-sharing
  const pwdClause = TERMS_OF_RESPONSIBILITY.find((c) => c.id === 'passwords');
  assert.ok(pwdClause, 'Password clause must exist');
  assert.match(pwdClause.title, /Senha/i);
  assert.match(pwdClause.description, /pessoal|intransferível|compartilhamento/i);

  // Clause 2: Sensitive client and medical data secrecy
  const dataClause = TERMS_OF_RESPONSIBILITY.find((c) => c.id === 'sensitive_data');
  assert.ok(dataClause, 'Sensitive data clause must exist');
  assert.match(dataClause.title, /Sigilo|Dados/i);
  assert.match(dataClause.description, /sensíveis|INSS|médic|laudo/i);

  // Clause 3: Physical station security and lock
  const stationClause = TERMS_OF_RESPONSIBILITY.find((c) => c.id === 'station_lock');
  assert.ok(stationClause, 'Station lock clause must exist');
  assert.match(stationClause.title, /Estação|Bloqueio/i);

  // Clause 4: Essential Cookies transparency
  const cookiesClause = TERMS_OF_RESPONSIBILITY.find((c) => c.id === 'cookies');
  assert.ok(cookiesClause, 'Cookies clause must exist');
  assert.match(cookiesClause.title, /Cookies/i);
  assert.match(cookiesClause.description, /essenciais|segurança|sessão/i);
});
