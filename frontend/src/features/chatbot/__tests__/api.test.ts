import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStream, deleteConversation, getHistory } from '../api';
import type { StreamEvent } from '../types';

const API_URL = 'http://localhost:4000/api/v1';

function sseChunk(...lines: string[]): Uint8Array {
  return new TextEncoder().encode(lines.join('\n') + '\n\n');
}

describe('fetchStream', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends POST request and yields SSE events', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(sseChunk('data: {"token":"Hello","done":false}'));
        controller.enqueue(sseChunk('data: {"token":" world","done":true}'));
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' },
      }),
    );

    const events: StreamEvent[] = [];
    for await (const event of fetchStream('Hi')) {
      events.push(event);
    }

    expect(globalThis.fetch).toHaveBeenCalledWith(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hi', conversationId: undefined }),
    });
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ token: 'Hello', done: false });
    expect(events[1]).toEqual({ token: ' world', done: true });
  });

  it('passes conversationId when provided', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(sseChunk('data: {"token":"x","done":true}'));
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream),
    );

    const events: StreamEvent[] = [];
    for await (const event of fetchStream('Hi', 'conv-123')) {
      events.push(event);
    }

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${API_URL}/chat`,
      expect.objectContaining({
        body: JSON.stringify({ message: 'Hi', conversationId: 'conv-123' }),
      }),
    );
  });

  it('skips malformed SSE lines', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(sseChunk('data: not json'));
        controller.enqueue(sseChunk('data: {"token":"ok","done":true}'));
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream),
    );

    const events: StreamEvent[] = [];
    for await (const event of fetchStream('Hi')) {
      events.push(event);
    }

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ token: 'ok', done: true });
  });

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Bad Request', { status: 400 }),
    );

    await expect(async () => {
      for await (const _ of fetchStream('Hi')) {
        // noop
      }
    }).rejects.toThrow('Bad Request');
  });

  it('throws on network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network failure'));

    await expect(async () => {
      for await (const _ of fetchStream('Hi')) {
        // noop
      }
    }).rejects.toThrow('Network failure');
  });

  it('throws when response body is null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null),
    );

    await expect(async () => {
      for await (const _ of fetchStream('Hi')) {
        // noop
      }
    }).rejects.toThrow('No response body');
  });
});

describe('deleteConversation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends DELETE request', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    await deleteConversation('conv-123');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${API_URL}/chat/conv-123`,
      { method: 'DELETE' },
    );
  });

  it('does not throw on 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 404 }),
    );

    await expect(deleteConversation('conv-123')).resolves.toBeUndefined();
  });

  it('throws on other error status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 500 }),
    );

    await expect(deleteConversation('conv-123')).rejects.toThrow();
  });
});

describe('getHistory', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns conversation on success', async () => {
    const conversation = {
      conversationId: 'conv-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{ role: 'user' as const, content: 'Hi' }],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(conversation), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await getHistory('conv-123');
    expect(result).toEqual(conversation);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${API_URL}/chat/conv-123`,
    );
  });

  it('throws on 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 404 }),
    );

    await expect(getHistory('conv-123')).rejects.toThrow('Conversation not found');
  });

  it('throws on other error status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 500 }),
    );

    await expect(getHistory('conv-123')).rejects.toThrow('Failed to load history: 500');
  });
});
