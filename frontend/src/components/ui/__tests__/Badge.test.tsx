import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>React</Badge>);
    expect(screen.getByText('React')).toBeInTheDocument();
  });
});
