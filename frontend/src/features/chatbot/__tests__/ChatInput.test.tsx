import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  it('renders input and send button', () => {
    render(<ChatInput onSend={vi.fn()} disabled={false} />);
    expect(screen.getByPlaceholderText('Ask about my experience...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onSend with input text on submit', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} disabled={false} />);

    await user.type(screen.getByPlaceholderText('Ask about my experience...'), 'Hello');
    await user.click(screen.getByRole('button'));

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('clears input after sending', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} disabled={false} />);

    const input = screen.getByPlaceholderText('Ask about my experience...');
    await user.type(input, 'Hello');
    await user.click(screen.getByRole('button'));

    expect(input).toHaveValue('');
  });

  it('disables input and button when disabled', () => {
    render(<ChatInput onSend={vi.fn()} disabled={true} />);
    expect(screen.getByPlaceholderText('Ask about my experience...')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onSend with empty text', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled={false} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('sends on Enter key', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} disabled={false} />);

    const input = screen.getByPlaceholderText('Ask about my experience...');
    await user.type(input, 'Hello{Enter}');

    expect(onSend).toHaveBeenCalledWith('Hello');
    expect(input).toHaveValue('');
  });
});
