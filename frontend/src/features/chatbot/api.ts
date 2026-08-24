import type { Conversation, StreamEvent } from './types';
import { API_URL } from '../../lib/api';

export async function* fetchStream(
  message: string,
  conversationId?: string,
): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed with status ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        try {
          const parsed: StreamEvent = JSON.parse(trimmed.slice(6));
          yield parsed;
        } catch {
          // skip malformed chunks
        }
      }
    }
  }
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const res = await fetch(`${API_URL}/chat/${conversationId}`, {
    method: 'DELETE',
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete conversation: ${res.status}`);
  }
}

export async function getHistory(conversationId: string): Promise<Conversation> {
  const res = await fetch(`${API_URL}/chat/${conversationId}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Conversation not found');
    }
    throw new Error(`Failed to load history: ${res.status}`);
  }

  return res.json();
}
