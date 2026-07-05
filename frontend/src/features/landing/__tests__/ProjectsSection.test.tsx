import { render, screen } from '@testing-library/react';
import { ProjectsSection } from '../ProjectsSection';
import { mockProfile } from '../../../test/mockProfile';

describe('ProjectsSection', () => {
  it('renders loading state with skeletons', () => {
    const { container } = render(<ProjectsSection profile={null} loading={true} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(10);
  });

  it('renders skills as badges', () => {
    render(<ProjectsSection profile={mockProfile} loading={false} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });
});
