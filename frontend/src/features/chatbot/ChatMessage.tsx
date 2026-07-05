import type { ChatMessage as ChatMessageType } from './types';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export const ChatMessage = ({ message, isStreaming }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isUser
            ? 'bg-accent text-white'
            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1.5 animate-pulse bg-current ml-0.5 rounded-full" />
          )}
        </p>
      </div>
    </div>
  );
};
