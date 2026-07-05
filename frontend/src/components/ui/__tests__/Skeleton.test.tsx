import { render } from '@testing-library/react';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders with default classes', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('animate-pulse');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-8 w-48" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('h-8');
    expect(el.className).toContain('w-48');
  });
});
