import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWidget } from '../ChatWidget';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' });
  localStorage.clear();
});

describe('ChatWidget', () => {
  it('renders floating button when closed', () => {
    render(<ChatWidget />);
    expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
  });

  it('opens chat panel on button click', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByLabelText('Open chat'));

    expect(screen.getByText('AI Career Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask about my experience...')).toBeInTheDocument();
  });

  it('closes chat panel on X click', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByLabelText('Open chat'));
    expect(screen.getByText('AI Career Assistant')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Close chat'));
    expect(screen.queryByText('AI Career Assistant')).not.toBeInTheDocument();
  });

  it('shows empty state when no messages', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByLabelText('Open chat'));

    expect(screen.getByText('Ask me anything about my experience, skills, or projects.')).toBeInTheDocument();
  });

  it('shows New Chat button when open', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByLabelText('Open chat'));

    expect(screen.getByText('New Chat')).toBeInTheDocument();
  });
});
