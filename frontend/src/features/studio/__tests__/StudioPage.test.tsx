import { render, screen } from '@testing-library/react';
import { StudioPage } from '../StudioPage';

describe('StudioPage', () => {
  it('renders canvas studio heading', () => {
    render(<StudioPage />);
    expect(screen.getByText('Canvas Studio')).toBeInTheDocument();
  });
});
