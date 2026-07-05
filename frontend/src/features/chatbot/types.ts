export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface StreamEvent {
  token: string;
  done: boolean;
  error?: string;
}
