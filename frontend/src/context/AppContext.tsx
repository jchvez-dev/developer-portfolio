import { createContext, useContext, useState, type ReactNode } from 'react';

interface AppContextValue {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <AppContext.Provider value={{ chatOpen, setChatOpen }}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { AppProvider };
