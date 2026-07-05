import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('renders copyright with current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(<Footer />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });
});
