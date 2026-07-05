import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';
import type { ChatMessage as ChatMessageType } from '../types';

describe('ChatMessage', () => {
  const userMsg: ChatMessageType = { role: 'user', content: 'Hello' };
  const assistantMsg: ChatMessageType = { role: 'assistant', content: 'Hi there!' };

  it('renders user message on the right', () => {
    render(<ChatMessage message={userMsg} />);
    const container = screen.getByText('Hello').parentElement;
    expect(container?.parentElement?.className).toContain('justify-end');
  });

  it('renders assistant message on the left', () => {
    render(<ChatMessage message={assistantMsg} />);
    const container = screen.getByText('Hi there!').parentElement;
    expect(container?.parentElement?.className).toContain('justify-start');
  });

  it('renders user message with accent background', () => {
    render(<ChatMessage message={userMsg} />);
    const bubble = screen.getByText('Hello').parentElement;
    expect(bubble?.className).toContain('bg-accent');
  });

  it('renders assistant message with gray background', () => {
    render(<ChatMessage message={assistantMsg} />);
    const bubble = screen.getByText('Hi there!').parentElement;
    expect(bubble?.className).toContain('bg-gray-100');
  });

  it('shows cursor when isStreaming is true', () => {
    render(<ChatMessage message={assistantMsg} isStreaming />);
    expect(screen.getByText('Hi there!').querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('does not show cursor when isStreaming is false', () => {
    render(<ChatMessage message={assistantMsg} />);
    expect(screen.getByText('Hi there!').querySelector('.animate-pulse')).not.toBeInTheDocument();
  });
});
