import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="extra">Content</Card>);
    expect(screen.getByText('Content').className).toContain('extra');
  });
});
