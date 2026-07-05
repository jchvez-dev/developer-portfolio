import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationList } from '../ConversationList';

describe('ConversationList', () => {
  it('renders new chat button', () => {
    render(<ConversationList onNew={vi.fn()} />);
    expect(screen.getByText('New Chat')).toBeInTheDocument();
  });

  it('calls onNew when button is clicked', async () => {
    const onNew = vi.fn();
    const user = userEvent.setup();
    render(<ConversationList onNew={onNew} />);
    await user.click(screen.getByText('New Chat'));
    expect(onNew).toHaveBeenCalledOnce();
  });
});
