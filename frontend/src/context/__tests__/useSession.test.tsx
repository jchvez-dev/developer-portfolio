import { renderHook, act } from '@testing-library/react';
import { useSession } from '../useSession';

const UUID_PATTERN = /^uuid-\d+$/;

beforeEach(() => {
  let counter = 0;
  vi.stubGlobal('crypto', {
    randomUUID: () => `uuid-${++counter}`,
  });
  localStorage.clear();
});

describe('useSession', () => {
  it('generates a session ID on first call', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.sessionId).toMatch(UUID_PATTERN);
  });

  it('persists session ID in localStorage', () => {
    const { result } = renderHook(() => useSession());
    expect(localStorage.getItem('session-id')).toBe(result.current.sessionId);
  });

  it('reuses existing session ID from localStorage', () => {
    localStorage.setItem('session-id', 'existing-id');
    const { result } = renderHook(() => useSession());
    expect(result.current.sessionId).toBe('existing-id');
  });

  it('resetSession generates a new ID', () => {
    const { result } = renderHook(() => useSession());
    const firstId = result.current.sessionId;

    act(() => {
      result.current.resetSession();
    });

    expect(result.current.sessionId).not.toBe(firstId);
  });

  it('resetSession updates localStorage', () => {
    const { result } = renderHook(() => useSession());
    const firstId = result.current.sessionId;

    act(() => {
      result.current.resetSession();
    });

    expect(localStorage.getItem('session-id')).toBe(result.current.sessionId);
    expect(localStorage.getItem('session-id')).not.toBe(firstId);
  });
});
