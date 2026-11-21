import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Item 20: Renderização no Servidor e no Build (SSR, SSG & Streaming)', () => {
  it('implements streaming loading skeleton for entire dashboard layout', () => {
    const dashboardLoadingPath = path.resolve(process.cwd(), 'src/app/(dashboard)/loading.tsx');
    assert.ok(fs.existsSync(dashboardLoadingPath), 'src/app/(dashboard)/loading.tsx must exist');
    const content = fs.readFileSync(dashboardLoadingPath, 'utf8');
    assert.ok(content.includes('DashboardTableSkeleton'), 'Must stream dashboard table skeleton');
  });

  it('implements streaming loading skeleton for dynamic client detail route', () => {
    const clientLoadingPath = path.resolve(process.cwd(), 'src/app/(dashboard)/clientes/[id]/loading.tsx');
    assert.ok(fs.existsSync(clientLoadingPath), 'src/app/(dashboard)/clientes/[id]/loading.tsx must exist');
    const content = fs.readFileSync(clientLoadingPath, 'utf8');
    assert.ok(content.includes('ClientDetailLoading'), 'Must stream client detail skeleton');
  });

  it('client detail page is an async server component with single-query nested join', () => {
    const clientPagePath = path.resolve(process.cwd(), 'src/app/(dashboard)/clientes/[id]/page.tsx');
    const content = fs.readFileSync(clientPagePath, 'utf8');
    assert.ok(!content.includes("'use client'"), 'ClientDetailPage must not be a client component');
    assert.ok(content.includes('export default async function ClientDetailPage'), 'Must be async Server Component');
    assert.ok(content.includes("select('*, attendances(*)')"), 'Must use nested PostgREST join');
  });
});
