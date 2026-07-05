import { render, screen, waitFor } from '@testing-library/react';
import { useProfile } from '../useProfile';
import { mockProfile } from '../../../test/mockProfile';

const TestComponent = () => {
  const { profile, loading, error } = useProfile();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile</div>;

  return <div>Name: {profile.name}</div>;
};

describe('useProfile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(
      new Promise(() => {}),
    );

    render(<TestComponent />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('returns profile data on successful fetch', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockProfile), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByText('Name: Juan Chavez')).toBeInTheDocument();
    });
  });

  it('returns error on failed fetch', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 500 }),
    );

    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByText(/Error/)).toBeInTheDocument();
    });
  });

  it('returns error on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });
});
