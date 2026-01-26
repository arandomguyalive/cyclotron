"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

interface ZenModeContextType {
  isZenMode: boolean;
  toggleZenMode: () => void;
}

const ZenModeContext = createContext<ZenModeContextType | undefined>(undefined);

export function ZenModeProvider({ children }: { children: ReactNode }) {
  const [isZenMode, setIsZenMode] = useState(false);

  const toggleZenMode = () => {
    setIsZenMode(prev => !prev);
  };

  const value = useMemo(() => ({
    isZenMode,
    toggleZenMode,
  }), [isZenMode]);

  return (
    <ZenModeContext.Provider value={value}>
      {children}
    </ZenModeContext.Provider>
  );
}

export function useZenMode() {
  const context = useContext(ZenModeContext);
  if (context === undefined) {
    throw new Error('useZenMode must be used within a ZenModeProvider');
  }
  return context;
}
