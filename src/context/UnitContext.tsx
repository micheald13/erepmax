'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Unit = 'kg' | 'lbs';

interface UnitContextValue {
  unit: Unit;
  setUnit: (unit: Unit) => void;
}

const UnitContext = createContext<UnitContextValue>({
  unit: 'kg',
  setUnit: () => {},
});

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnitState] = useState<Unit>('kg');

  useEffect(() => {
    const stored = localStorage.getItem('erepmax_unit');
    if (stored === 'kg' || stored === 'lbs') {
      setUnitState(stored);
    }
  }, []);

  const setUnit = (u: Unit) => {
    localStorage.setItem('erepmax_unit', u);
    setUnitState(u);
  };

  return (
    <UnitContext.Provider value={{ unit, setUnit }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  return useContext(UnitContext);
}
