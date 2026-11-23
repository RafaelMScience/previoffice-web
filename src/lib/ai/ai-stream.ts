/**
 * AI Streaming Utility (Token-by-Token SSE Streamer with Abort/Stop Capability).
 * Allows real-time rendering of generated legal clauses and AI assistance.
 */

export interface AiStreamChunk {
  token: string;
  index: number;
  done?: boolean;
}

/**
 * Creates a standard Web ReadableStream that streams tokens in Server-Sent Events (SSE) format.
 */
export function createAiTokenStream(
  text: string,
  chunkDelayMs: number = 30
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  // Split by words/punctuation tokens while preserving spaces
  const tokens = text.match(/\S+|\s+/g) || [text];

  let index = 0;
  let intervalId: any = null;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      intervalId = setInterval(() => {
        if (index >= tokens.length) {
          clearInterval(intervalId);
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        const token = tokens[index];
        const payload: AiStreamChunk = {
          token,
          index,
          done: index === tokens.length - 1,
        };

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        index++;
      }, chunkDelayMs);
    },
    cancel() {
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
  });
}

/**
 * Consumes an SSE AI stream on client or server side, calling onToken for each token received.
 * Supports immediate cancellation via AbortSignal ("Botão de Parar").
 */
export async function consumeAiTokenStream(
  stream: ReadableStream<Uint8Array>,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel(signal.reason);
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.substring(5).trim();
        if (dataStr === '[DONE]') {
          return fullText;
        }

        try {
          const parsed: AiStreamChunk = JSON.parse(dataStr);
          if (parsed.token) {
            fullText += parsed.token;
            onToken(parsed.token);
          }
        } catch {
          // Ignore invalid JSON chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}
