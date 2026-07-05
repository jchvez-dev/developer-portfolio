import { useCallback, useState } from 'react';

const STORAGE_KEY = 'session-id';

function generateId(): string {
  return crypto.randomUUID();
}

function readSession(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeSession(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string>(() => {
    const stored = readSession();
    if (stored) return stored;
    const newId = generateId();
    writeSession(newId);
    return newId;
  });

  const resetSession = useCallback(() => {
    const newId = generateId();
    writeSession(newId);
    setSessionId(newId);
  }, []);

  return { sessionId, resetSession } as const;
}
