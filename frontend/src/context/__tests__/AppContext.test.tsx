import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '../AppContext';

const TestComponent = () => {
  const { chatOpen, setChatOpen } = useApp();
  return (
    <div>
      <span data-testid="chat-value">{chatOpen ? 'open' : 'closed'}</span>
      <button onClick={() => setChatOpen(true)}>Open</button>
      <button onClick={() => setChatOpen(false)}>Close</button>
    </div>
  );
};

describe('AppContext', () => {
  it('provides default chatOpen as false', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );

    expect(screen.getByTestId('chat-value').textContent).toBe('closed');
  });

  it('updates chatOpen state', async () => {
    const user = userEvent.setup();

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByTestId('chat-value').textContent).toBe('open');

    await user.click(screen.getByText('Close'));
    expect(screen.getByTestId('chat-value').textContent).toBe('closed');
  });

  it('throws error when used outside AppProvider', () => {
    expect(() => render(<TestComponent />)).toThrow('useApp must be used within AppProvider');
  });
});
