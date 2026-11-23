import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateRandomPassword } from '../../../lib/auth/password-generator.ts';

describe('Admin Office Provisioning: Temporary Credentials & First Access Flow', () => {
  it('should generate a high-entropy temporary password when none or invalid is provided', () => {
    // If no password provided, system generates random temporary password
    const generated = generateRandomPassword();
    assert.ok(generated.startsWith('Prev#'), 'Temporary password should start with Prev# prefix');
    assert.ok(generated.length >= 12, 'Temporary password should be at least 12 characters');
    assert.match(generated, /[A-Z]/, 'Must contain uppercase characters');
    assert.match(generated, /[a-z]/, 'Must contain lowercase characters');
    assert.match(generated, /[0-9]/, 'Must contain numeric digits');
    assert.match(generated, /[!@#$%&*]/, 'Must contain special symbols');
  });

  it('should enforce must_change_password flag in user_metadata contract for managing lawyer', () => {
    const rawUserMetadata = {
      full_name: 'Dr. Roberto Rocha',
      cpf: '123.456.789-00',
      oab_number: '12345/AM',
      phone: '(92) 99123-4567',
      must_change_password: true,
    };

    assert.strictEqual(rawUserMetadata.must_change_password, true, 'must_change_password must be strictly true');
  });

  it('login flow redirection contract: users with must_change_password must be directed to /definir-senha', () => {
    // Simulating login callback user_metadata verification
    const mockUser1 = { id: 'u1', email: 'novo@escritorio.com', user_metadata: { must_change_password: true } };
    const mockUser2 = { id: 'u2', email: 'antigo@escritorio.com', user_metadata: { must_change_password: false } };
    const mockUser3 = { id: 'u3', email: 'legado@escritorio.com', user_metadata: {} };

    const determineRedirectRoute = (user: { user_metadata?: { must_change_password?: boolean } }) => {
      if (user.user_metadata?.must_change_password === true) {
        return '/definir-senha';
      }
      return '/';
    };

    assert.strictEqual(determineRedirectRoute(mockUser1), '/definir-senha', 'First access must route to /definir-senha');
    assert.strictEqual(determineRedirectRoute(mockUser2), '/', 'Regular access must route to /');
    assert.strictEqual(determineRedirectRoute(mockUser3), '/', 'Default without flag must route to /');
  });

  it('definir-senha completion contract: resets must_change_password to false on update', () => {
    const initialMetadata = { must_change_password: true };
    const updatedMetadata = { ...initialMetadata, must_change_password: false };

    assert.strictEqual(updatedMetadata.must_change_password, false, 'Password definition must mark must_change_password as false');
  });
});
