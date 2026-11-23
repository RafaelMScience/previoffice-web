import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Item 21: Carregamento de Scripts de Terceiros sem Bloqueio (defer/lazyOnload)', () => {
  it('confirms the codebase has zero synchronous/blocking script tags', () => {
    const layoutPath = path.resolve(process.cwd(), 'src/app/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');

    // Asserts no raw <script src=...> without async or defer exists in root layout
    const hasRawBlockingScript = /<script\s+src=/i.test(layoutContent);
    assert.equal(hasRawBlockingScript, false, 'Root layout must not include blocking synchronous <script src=...>');
  });

  it('provides DeferredThirdPartyScript component configured with lazyOnload strategy', () => {
    const componentPath = path.resolve(process.cwd(), 'src/components/scripts/deferred-script.tsx');
    assert.ok(fs.existsSync(componentPath), 'DeferredThirdPartyScript component must exist');

    const content = fs.readFileSync(componentPath, 'utf8');
    assert.ok(content.includes("strategy = 'lazyOnload'"), 'Must default to lazyOnload strategy for idle execution');
    assert.ok(content.includes("from 'next/script'"), 'Must leverage Next.js optimized Script engine');
  });
});
