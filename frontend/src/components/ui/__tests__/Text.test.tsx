import { render, screen } from '@testing-library/react';
import { Text } from '../Text';

describe('Text', () => {
  it('renders children', () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies muted styles when muted prop is set', () => {
    render(<Text muted>Muted</Text>);
    expect(screen.getByText('Muted').className).toContain('text-gray-400');
  });

  it('applies small styles when small prop is set', () => {
    render(<Text small>Small</Text>);
    expect(screen.getByText('Small').className).toContain('text-sm');
  });

  it('applies custom className', () => {
    render(<Text className="custom">Styled</Text>);
    expect(screen.getByText('Styled').className).toContain('custom');
  });

  it('renders as span when as prop is set', () => {
    render(<Text as="span">Inline</Text>);
    expect(screen.getByText('Inline').tagName).toBe('SPAN');
  });
});
