import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext';
import { Layout } from '../Layout';

describe('Layout', () => {
  it('renders header, main content area, and footer', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <ThemeProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="test" element={<p>Page Content</p>} />
            </Route>
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Juan Chavez')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });
});
