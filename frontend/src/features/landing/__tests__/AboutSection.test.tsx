import { render, screen } from '@testing-library/react';
import { AboutSection } from '../AboutSection';
import { mockProfile } from '../../../test/mockProfile';

describe('AboutSection', () => {
  it('renders loading state with skeletons', () => {
    const { container } = render(<AboutSection profile={null} loading={true} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it('renders summary highlights', () => {
    render(<AboutSection profile={mockProfile} loading={false} />);
    expect(screen.getByText('Full-stack engineer with 8+ years of experience')).toBeInTheDocument();
    expect(screen.getByText('Specialist in React, Node.js, and cloud-native architectures')).toBeInTheDocument();
  });

  it('renders experience cards', () => {
    render(<AboutSection profile={mockProfile} loading={false} />);
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Tech Corp'))).toBeInTheDocument();
    expect(screen.getByText('Platform Migration')).toBeInTheDocument();
  });
});
