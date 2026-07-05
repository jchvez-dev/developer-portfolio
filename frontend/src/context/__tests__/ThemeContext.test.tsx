import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../ThemeContext';

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('provides default theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const themeEl = screen.getByTestId('theme-value');
    expect(['dark', 'light']).toContain(themeEl.textContent);
  });

  it('toggles theme', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const initialTheme = screen.getByTestId('theme-value').textContent;
    await user.click(screen.getByText('Toggle'));
    const toggledTheme = screen.getByTestId('theme-value').textContent;
    expect(toggledTheme).toBe(initialTheme === 'dark' ? 'light' : 'dark');
  });

  it('persists theme to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const initialTheme = screen.getByTestId('theme-value').textContent;
    await user.click(screen.getByText('Toggle'));
    expect(localStorage.getItem('theme')).toBe(initialTheme === 'dark' ? 'light' : 'dark');
  });

  it('sets data-theme attribute on root element', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const root = document.documentElement;
    const initialTheme = screen.getByTestId('theme-value').textContent;
    expect(root.classList.contains(initialTheme!)).toBe(true);

    await user.click(screen.getByText('Toggle'));
    expect(root.classList.contains(initialTheme === 'dark' ? 'light' : 'dark')).toBe(true);
  });

  it('throws error when used outside ThemeProvider', () => {
    expect(() => render(<TestComponent />)).toThrow('useTheme must be used within ThemeProvider');
  });
});
