import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type DemoModeContextValue = {
  /** Pest outbreak demo — intensifies map risk, metrics, and feed */
  pestOutbreakSim: boolean;
  simulatePestOutbreak: () => void;
  clearPestDemo: () => void;
};

const DemoModeContext = createContext<DemoModeContextValue | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [pestOutbreakSim, setPestOutbreakSim] = useState(false);

  const simulatePestOutbreak = useCallback(() => {
    setPestOutbreakSim(true);
  }, []);

  const clearPestDemo = useCallback(() => {
    setPestOutbreakSim(false);
  }, []);

  const value = useMemo(
    () => ({ pestOutbreakSim, simulatePestOutbreak, clearPestDemo }),
    [pestOutbreakSim, simulatePestOutbreak, clearPestDemo],
  );

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return ctx;
}
