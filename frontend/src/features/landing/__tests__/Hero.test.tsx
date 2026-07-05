import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../../context/AppContext';
import { Hero } from '../Hero';
import { mockProfile } from '../../../test/mockProfile';

describe('Hero', () => {
  const renderHero = (props: Parameters<typeof Hero>[0]) =>
    render(
      <MemoryRouter>
        <AppProvider>
          <Hero {...props} />
        </AppProvider>
      </MemoryRouter>,
    );

  it('renders loading state with skeletons', () => {
    renderHero({ profile: null, loading: true });
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders profile name and title', () => {
    renderHero({ profile: mockProfile, loading: false });
    expect(screen.getByText('Juan Chavez')).toBeInTheDocument();
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    renderHero({ profile: mockProfile, loading: false });
    expect(screen.getByText('Try Canvas Studio')).toBeInTheDocument();
    expect(screen.getByText('Ask AI Assistant')).toBeInTheDocument();
  });
});
