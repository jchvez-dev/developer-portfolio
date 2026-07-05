import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteConversation, fetchStream, getHistory } from './api';
import { useSession } from '../../context/useSession';
import type { ChatMessage } from './types';

export function useChat() {
  const { sessionId } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const historyLoadedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || historyLoadedRef.current) return;
    historyLoadedRef.current = true;

    getHistory(sessionId)
      .then((conv) => setMessages(conv.messages))
      .catch(() => {});
  }, [sessionId]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    setIsStreaming(true);

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);

    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for await (const event of fetchStream(trimmed, sessionId)) {
        if (controller.signal.aborted) break;

        if (event.error) {
          setError(event.error);
          setMessages((prev) => prev.slice(0, -1));
          setIsStreaming(false);
          return;
        }

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + event.token,
            };
          }
          return updated;
        });

        if (event.done) {
          setIsStreaming(false);
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Stream failed');
        setMessages((prev) => prev.slice(0, -1));
      }
      setIsStreaming(false);
    } finally {
      abortRef.current = null;
    }
  }, [isStreaming, sessionId]);

  const newConversation = useCallback(() => {
    if (isStreaming) {
      abortRef.current?.abort();
    }
    deleteConversation(sessionId).catch(() => {});
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, [isStreaming, sessionId]);

  return {
    isOpen,
    toggleOpen,
    messages,
    isStreaming,
    error,
    sendMessage,
    newConversation,
    sessionId,
  };
}
