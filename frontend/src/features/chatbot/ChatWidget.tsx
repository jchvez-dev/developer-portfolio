import { useEffect, useRef } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useChat } from './useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ConversationList } from './ConversationList';
import { TypingIndicator } from './TypingIndicator';

export const ChatWidget = () => {
  const {
    isOpen,
    toggleOpen,
    messages,
    isStreaming,
    error,
    sendMessage,
    newConversation,
  } = useChat();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="flex h-[500px] w-[360px] flex-col rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              AI Career Assistant
            </span>
            <button
              onClick={toggleOpen}
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Close chat"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <ConversationList onNew={newConversation} />

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && !isStreaming && (
              <p className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
                Ask me anything about my experience, skills, or projects.
              </p>
            )}

            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
      ) : (
        <button
          onClick={toggleOpen}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 hover:bg-accent-hover"
          aria-label="Open chat"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
