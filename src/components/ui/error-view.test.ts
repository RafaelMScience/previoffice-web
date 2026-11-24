import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getErrorConfig } from '../../lib/utils/error-config.ts';

describe('ErrorView Component & Configuration Tests', () => {
  it('should return correct configuration for HTTP 400 Bad Request', () => {
    const config = getErrorConfig(400);
    assert.ok(config.badge.includes('400'));
    assert.strictEqual(config.defaultTitle, 'Parâmetros Incompletos ou Inválidos');
    assert.ok(config.defaultDescription.includes('parâmetros'));
    assert.strictEqual(config.iconType, 'alert');
    assert.ok(config.iconBg.includes('amber'));
  });

  it('should return correct configuration for HTTP 404 Not Found', () => {
    const config = getErrorConfig(404);
    assert.ok(config.badge.includes('404'));
    assert.strictEqual(config.defaultTitle, 'Página ou Registro Não Encontrado');
    assert.ok(config.defaultDescription.includes('não existe'));
    assert.strictEqual(config.iconType, 'file-question');
    assert.ok(config.iconBg.includes('sky'));
  });

  it('should return correct configuration for HTTP 500 Internal Server Error', () => {
    const config = getErrorConfig(500);
    assert.ok(config.badge.includes('500'));
    assert.strictEqual(config.defaultTitle, 'Instabilidade Momentânea de Processamento');
    assert.ok(config.defaultDescription.includes('falha inesperada'));
    assert.strictEqual(config.iconType, 'server-crash');
    assert.ok(config.iconBg.includes('rose'));
  });

  it('should return safe fallback configuration for unknown error codes', () => {
    const config = getErrorConfig(418);
    assert.ok(config.badge.includes('418'));
    assert.strictEqual(config.defaultTitle, 'Não Foi Possível Concluir a Operação');
    assert.ok(config.iconBg.includes('slate'));
  });

  it('security invariant: error descriptions must not leak internal database, SQL or stack trace details', () => {
    const codes = [400, 404, 500];
    const forbiddenPatterns = [
      /select\s+/i,
      /pg_catalog/i,
      /postgres/i,
      /supabase_service_role/i,
      /stack trace/i,
      /at\s+[\w.]+\s+\(/i,
      /node_modules/i,
    ];

    for (const code of codes) {
      const config = getErrorConfig(code);
      const combinedText = `${config.badge} ${config.defaultTitle} ${config.defaultDescription}`;
      for (const pattern of forbiddenPatterns) {
        assert.strictEqual(
          pattern.test(combinedText),
          false,
          `Error config for code ${code} must not leak sensitive information matching ${pattern}`
        );
      }
    }
  });
});
