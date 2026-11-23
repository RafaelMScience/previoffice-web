import { describe, it } from 'node:test';
import assert from 'node:assert';
import { escapeHtml } from './xss.ts';

describe('Security Utility: escapeHtml', () => {
  it('should escape dangerous HTML characters (&, <, >, ", \')', () => {
    const dangerous = `<script>alert("XSS & Injection's test")</script>`;
    const escaped = escapeHtml(dangerous);

    assert.strictEqual(
      escaped,
      '&lt;script&gt;alert(&quot;XSS &amp; Injection&#39;s test&quot;)&lt;/script&gt;'
    );
  });

  it('should neutralize title breakout payloads', () => {
    const payload = `</title><img src="x" onerror="fetch('/leak?c='+document.cookie)">`;
    const escaped = escapeHtml(payload);

    assert.strictEqual(escaped.includes('<script>'), false);
    assert.strictEqual(escaped.includes('</title>'), false);
    assert.strictEqual(escaped.includes('<img'), false);
    assert.strictEqual(
      escaped,
      '&lt;/title&gt;&lt;img src=&quot;x&quot; onerror=&quot;fetch(&#39;/leak?c=&#39;+document.cookie)&quot;&gt;'
    );
  });

  it('should handle null, undefined, empty, and non-string values gracefully', () => {
    assert.strictEqual(escapeHtml(null), '');
    assert.strictEqual(escapeHtml(undefined), '');
    assert.strictEqual(escapeHtml(''), '');
    assert.strictEqual(escapeHtml(12345), '12345');
    assert.strictEqual(escapeHtml(0), '0');
    assert.strictEqual(escapeHtml(false), 'false');
  });

  it('should leave safe plain text unchanged', () => {
    const safe = 'Jose da Silva Santos - Contrato 2026/01';
    assert.strictEqual(escapeHtml(safe), safe);
  });
});
