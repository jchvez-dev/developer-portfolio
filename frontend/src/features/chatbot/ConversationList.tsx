import { HiPlus } from 'react-icons/hi2';

interface ConversationListProps {
  onNew: () => void;
}

export const ConversationList = ({ onNew }: ConversationListProps) => (
  <div className="border-b border-gray-200 p-3 dark:border-gray-700">
    <button
      onClick={onNew}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      <HiPlus className="h-4 w-4" />
      New Chat
    </button>
  </div>
);
