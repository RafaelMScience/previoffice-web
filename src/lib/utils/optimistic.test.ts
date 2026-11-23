import { describe, it } from 'node:test';
import assert from 'node:assert';
import { executeOptimisticAction } from './optimistic.ts';

describe('Item 14: Atualização Otimista da Interface com Rollback', () => {
  it('should apply optimistic update immediately before mutation finishes', async () => {
    let state = [{ id: 'doc_1', name: 'Documento 1' }, { id: 'doc_2', name: 'Documento 2' }];
    let serverDone = false;

    const actionPromise = executeOptimisticAction({
      current: state,
      optimistic: (prev) => prev.filter((d) => d.id !== 'doc_1'),
      applyState: (next) => {
        state = next;
      },
      mutation: async () => {
        await new Promise((res) => setTimeout(res, 50));
        serverDone = true;
        return { ok: true };
      },
    });

    // Immediately after invoking, state must already be updated (0ms latency perceived)
    assert.strictEqual(state.length, 1);
    assert.strictEqual(state[0].id, 'doc_2');
    assert.strictEqual(serverDone, false);

    await actionPromise;
    assert.strictEqual(serverDone, true);
    assert.strictEqual(state.length, 1);
  });

  it('should automatically rollback to previous snapshot when server returns error', async () => {
    let state = [{ id: 'inst_1', status: 'PENDING' }];
    let errorMessage = '';

    const success = await executeOptimisticAction({
      current: state,
      optimistic: (prev) => prev.map((i) => ({ ...i, status: 'PAID' })),
      applyState: (next) => {
        state = next;
      },
      mutation: async () => {
        throw new Error('Falha de conexão com o banco de dados');
      },
      onError: (err) => {
        errorMessage = err.message;
      },
    });

    // Operation failed on server
    assert.strictEqual(success, false);
    assert.strictEqual(errorMessage, 'Falha de conexão com o banco de dados');
    // State rolled back to original snapshot
    assert.strictEqual(state[0].status, 'PENDING');
  });
});
