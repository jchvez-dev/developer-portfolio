import { render, screen } from '@testing-library/react';
import { Heading } from '../Heading';

describe('Heading', () => {
  it('renders h2 by default', () => {
    render(<Heading>Title</Heading>);
    const el = screen.getByText('Title');
    expect(el.tagName).toBe('H2');
  });

  it('renders specified heading level', () => {
    render(<Heading as="h1">H1</Heading>);
    expect(screen.getByText('H1').tagName).toBe('H1');
  });

  it('applies custom className', () => {
    render(<Heading className="custom">Styled</Heading>);
    expect(screen.getByText('Styled').className).toContain('custom');
  });
});
