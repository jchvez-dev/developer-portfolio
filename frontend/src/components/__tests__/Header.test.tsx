import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext';
import { Header } from '../Header';

describe('Header', () => {
  const renderHeader = () =>
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>,
    );

  it('renders navigation links', () => {
    renderHeader();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    renderHeader();
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
  });

  it('toggles theme on button click', async () => {
    const user = userEvent.setup();
    renderHeader();
    const toggleBtn = screen.getByLabelText('Toggle theme');
    const initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    await user.click(toggleBtn);
    expect(document.documentElement.classList.contains(initialTheme === 'dark' ? 'light' : 'dark')).toBe(true);
  });
});
