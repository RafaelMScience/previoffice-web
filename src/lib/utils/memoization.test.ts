import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Item 26: Eliminação de Renders Desnecessários (Memoization & Context Optimization)', () => {
  it('i18n-context memoizes provider value and callback to stop cascade re-renders', () => {
    const filePath = path.resolve(process.cwd(), 'src/lib/i18n/i18n-context.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.ok(content.includes('useCallback'), 'Must use useCallback for setLocale');
    assert.ok(content.includes('useMemo('), 'Must use useMemo for context value');
    assert.ok(content.includes('<I18nContext.Provider value={value}>'), 'Provider must pass memoized value');
  });

  it('auth-context memoizes provider value and canAccess to stop unnecessary tree re-renders', () => {
    const filePath = path.resolve(process.cwd(), 'src/lib/auth/auth-context.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.ok(content.includes('useCallback'), 'Must use useCallback for canAccess');
    assert.ok(content.includes('useMemo('), 'Must use useMemo for contextValue');
    assert.ok(content.includes('<AuthContext.Provider value={contextValue}>'), 'Provider must pass memoized contextValue');
  });

  it('contracts-kpi-cards is wrapped in React.memo to prevent re-renders on parent state changes', () => {
    const filePath = path.resolve(process.cwd(), 'src/components/contracts/contracts-kpi-cards.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.ok(content.includes('React.memo('), 'ContractsKpiCards must be wrapped in React.memo');
  });
});
