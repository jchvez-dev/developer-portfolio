import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-accent');
  });

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('border');
  });

  it('applies danger variant', () => {
    render(<Button variant="danger">Danger</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-red-500');
  });

  it('applies custom className', () => {
    render(<Button className="custom">Styled</Button>);
    expect(screen.getByRole('button').className).toContain('custom');
  });

  it('disables button when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  describe('size', () => {
    it('applies sm size', () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button').className).toContain('px-3 py-1.5');
    });

    it('applies md size by default', () => {
      render(<Button>Medium</Button>);
      expect(screen.getByRole('button').className).toContain('px-6 py-2.5');
    });

    it('applies lg size', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button').className).toContain('px-8 py-3.5');
    });
  });

  describe('shape', () => {
    it('applies square shape by default', () => {
      render(<Button>Square</Button>);
      expect(screen.getByRole('button').className).toContain('rounded-lg');
    });

    it('applies pill shape', () => {
      render(<Button shape="pill">Pill</Button>);
      expect(screen.getByRole('button').className).toContain('rounded-full');
    });
  });

  describe('icon', () => {
    it('renders icon on the left by default', () => {
      render(<Button icon={<span data-testid="icon" />}>With Icon</Button>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders icon on the right', () => {
      render(<Button icon={<span data-testid="icon" />} iconPosition="right">With Icon</Button>);
      const btn = screen.getByRole('button');
      expect(btn.innerHTML).toMatch(/With Icon.*icon/);
    });

    it('adds gap when icon and children are present', () => {
      render(<Button icon={<span data-testid="icon" />}>Label</Button>);
      expect(screen.getByRole('button').className).toContain('gap-1.5');
    });

    it('does not add gap when icon is present without children', () => {
      render(<Button icon={<span data-testid="icon" />} />);
      expect(screen.getByRole('button').className).not.toContain('gap-1.5');
    });
  });
});
