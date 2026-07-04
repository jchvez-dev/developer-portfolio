export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}
