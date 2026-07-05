import { render, screen } from '@testing-library/react';
import { Section } from '../Section';

describe('Section', () => {
  it('renders with given id', () => {
    render(<Section id="about">Content</Section>);
    expect(screen.getByText('Content').closest('section')).toHaveAttribute('id', 'about');
  });

  it('renders title when provided', () => {
    render(<Section id="test" title="My Section">Content</Section>);
    expect(screen.getByText('My Section')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Section id="test" description="A description">Content</Section>);
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Section id="test"><span>Child</span></Section>);
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Section id="test" className="extra">Content</Section>);
    expect(screen.getByText('Content').closest('section')!.className).toContain('extra');
  });
});
