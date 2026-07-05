import { useState, type FormEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-gray-200 p-3 dark:border-gray-700">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about my experience..."
        disabled={disabled}
        className="min-h-10 flex-1 rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent focus:outline-none disabled:opacity-50 dark:border-gray-600"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        <PaperAirplaneIcon className="h-4 w-4" />
      </button>
    </form>
  );
};
