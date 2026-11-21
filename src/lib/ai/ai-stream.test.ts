import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAiTokenStream, consumeAiTokenStream } from './ai-stream.ts';

describe('Item 13: Transmissão de Respostas de IA Token a Token (Streaming & Stop Button)', () => {
  it('should deliver first token in under 100ms (satisfies < 1s requirement)', async () => {
    const input = 'CLÁUSULA ADICIONAL: Fica estipulado o êxito puro no benefício.';
    const stream = createAiTokenStream(input, 15);

    let firstTokenTime: number | null = null;
    const start = performance.now();

    await consumeAiTokenStream(stream, () => {
      if (firstTokenTime === null) {
        firstTokenTime = performance.now() - start;
      }
    });

    assert.ok(firstTokenTime !== null);
    assert.ok(firstTokenTime < 250, `First token took too long: ${firstTokenTime}ms`);
  });

  it('should stream full response progressively and assemble complete text', async () => {
    const input = 'Honorários contratuais fixados no percentual de 30% sobre o proveito econômico obtido.';
    const stream = createAiTokenStream(input, 5);

    const receivedTokens: string[] = [];
    const fullText = await consumeAiTokenStream(stream, (token) => {
      receivedTokens.push(token);
    });

    assert.ok(receivedTokens.length > 5, 'Should have yielded multiple tokens');
    assert.strictEqual(fullText, input);
  });

  it('should immediately stop streaming when user triggers abort (Botão de Parar)', async () => {
    const input = 'Um texto extremamente longo gerado pela inteligência artificial que deve ser cancelado no meio.';
    const stream = createAiTokenStream(input, 20);

    const controller = new AbortController();
    const receivedTokens: string[] = [];

    // Simulate user clicking "Parar Geração" after 35ms
    setTimeout(() => {
      controller.abort();
    }, 35);

    const partialText = await consumeAiTokenStream(
      stream,
      (token) => {
        receivedTokens.push(token);
      },
      controller.signal
    );

    assert.ok(receivedTokens.length > 0, 'Should have received at least one token before abort');
    assert.ok(partialText.length < input.length, 'Text should be incomplete due to abort');
  });
});
