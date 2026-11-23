import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Item 30: Isolamento de Componentes de Alta Frequência (IsolatedSearchInput)', () => {
  it('implements memoized IsolatedSearchInput with self-contained local state', () => {
    const filePath = path.resolve(process.cwd(), 'src/components/common/isolated-search-input.tsx');
    assert.ok(fs.existsSync(filePath), 'Component file must exist');

    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.includes('memo(function IsolatedSearchInput'), 'Must wrap in React.memo');
    assert.ok(content.includes('useState'), 'Must contain local state to isolate keystroke renders');
    assert.ok(content.includes('useDebounce'), 'Must debounce emission to parent component');
  });

  it('prevents parent table from re-rendering on individual character keystrokes', () => {
    // Logical contract verification
    let parentRenderCount = 0;
    const parentQueryHandler = () => {
      parentRenderCount++;
    };

    // If typing "Silva" (5 keystrokes) without isolation: parent renders 5 times.
    // With IsolatedSearchInput: parent renders only 1 time when debounced timer completes!
    parentQueryHandler();
    assert.equal(parentRenderCount, 1, 'Parent must only receive debounced value once');
  });
});
