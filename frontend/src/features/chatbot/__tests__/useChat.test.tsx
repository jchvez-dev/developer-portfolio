import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChat } from '../useChat';
import type { StreamEvent } from '../types';

const mockSessionId = 'test-session-id';

const { mockFetchStream, mockDeleteConversation, mockGetHistory } = vi.hoisted(() => ({
  mockFetchStream: vi.fn(),
  mockDeleteConversation: vi.fn(),
  mockGetHistory: vi.fn(),
}));

vi.mock('../../../context/useSession', () => ({
  useSession: () => ({ sessionId: mockSessionId, resetSession: vi.fn() }),
}));

vi.mock('../api', () => ({
  fetchStream: (...args: Parameters<typeof mockFetchStream>) => mockFetchStream(...args),
  deleteConversation: (...args: Parameters<typeof mockDeleteConversation>) => mockDeleteConversation(...args),
  getHistory: (...args: Parameters<typeof mockGetHistory>) => mockGetHistory(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetHistory.mockRejectedValue(new Error('no history'));
  mockDeleteConversation.mockResolvedValue(undefined);
});

describe('useChat', () => {
  it('starts with default state', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.sessionId).toBe(mockSessionId);
  });

  it('toggleOpen flips isOpen', () => {
    const { result } = renderHook(() => useChat());

    act(() => result.current.toggleOpen());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.toggleOpen());
    expect(result.current.isOpen).toBe(false);
  });

  it('attempts to load conversation history on mount', async () => {
    renderHook(() => useChat());
    await waitFor(() => {
      expect(mockGetHistory).toHaveBeenCalledWith(mockSessionId);
    });
  });

  it('loads messages from history on success', async () => {
    const historyMessages = [
      { role: 'user' as const, content: 'Hi' },
      { role: 'assistant' as const, content: 'Hello!' },
    ];
    mockGetHistory.mockResolvedValueOnce({
      conversationId: mockSessionId,
      createdAt: '',
      updatedAt: '',
      messages: historyMessages,
    });

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.messages).toEqual(historyMessages);
    });
  });

  it('sendMessage adds user and assistant messages', async () => {
    async function* generator(): AsyncGenerator<StreamEvent> {
      yield { token: 'Hello', done: false };
      yield { token: ' there', done: true };
    }
    mockFetchStream.mockReturnValueOnce(generator());

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hi');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({ role: 'user', content: 'Hi' });
    expect(result.current.messages[1]).toEqual({ role: 'assistant', content: 'Hello there' });
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sendMessage handles streaming tokens incrementally', async () => {
    async function* generator(): AsyncGenerator<StreamEvent> {
      yield { token: 'A', done: false };
      yield { token: 'B', done: false };
      yield { token: 'C', done: true };
    }
    mockFetchStream.mockReturnValueOnce(generator());

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hi');
    });

    expect(result.current.messages[1].content).toBe('ABC');
  });

  it('sendMessage removes assistant message on error event', async () => {
    async function* generator(): AsyncGenerator<StreamEvent> {
      yield { token: '', done: false, error: 'Something went wrong' };
    }
    mockFetchStream.mockReturnValueOnce(generator());

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hi');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual({ role: 'user', content: 'Hi' });
    expect(result.current.error).toBe('Something went wrong');
    expect(result.current.isStreaming).toBe(false);
  });

  it('sendMessage removes assistant message on stream exception', async () => {
    mockFetchStream.mockReturnValueOnce(
      (async function* () {
        yield await Promise.reject(new Error('Stream crashed'));
      })(),
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hi');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual({ role: 'user', content: 'Hi' });
    expect(result.current.error).toBe('Stream crashed');
    expect(result.current.isStreaming).toBe(false);
  });

  it('sendMessage does nothing for empty text', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(mockFetchStream).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });

  it('newConversation clears messages and calls delete', async () => {
    async function* generator(): AsyncGenerator<StreamEvent> {
      yield { token: 'ok', done: true };
    }
    mockFetchStream.mockReturnValueOnce(generator());

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hi');
    });
    expect(result.current.messages).toHaveLength(2);

    await act(async () => {
      await result.current.newConversation();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isStreaming).toBe(false);
    expect(mockDeleteConversation).toHaveBeenCalledWith(mockSessionId);
  });

  it('newConversation aborts active stream', async () => {
    async function* generator(): AsyncGenerator<StreamEvent> {
      yield { token: '...', done: false };
      await new Promise((_, reject) => {
        setInterval(() => {
          reject(new DOMException('Aborted', 'AbortError'));
        }, 10);
      });
    }
    mockFetchStream.mockReturnValueOnce(generator());

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage('Hi');
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
      await result.current.newConversation();
    });

    expect(result.current.messages).toEqual([]);
    expect(mockDeleteConversation).toHaveBeenCalledWith(mockSessionId);
  });
});
