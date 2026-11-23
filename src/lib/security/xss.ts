/**
 * Security Utility: HTML Escaping for DOM XSS prevention (OWASP A03:2021)
 * Neutralizes potential script and markup injection in dynamic templates,
 * print windows, and document.write / innerHTML calls.
 */

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = typeof value === 'string' ? value : String(value);

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
