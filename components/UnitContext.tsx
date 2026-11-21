'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UnitSystem } from '@/lib/types';

interface UnitContextType {
  unitSystem: UnitSystem;
  toggleUnitSystem: () => void;
  setUnitSystem: (system: UnitSystem) => void;
}

const UnitContext = createContext<UnitContextType>({
  unitSystem: 'metric',
  toggleUnitSystem: () => {},
  setUnitSystem: () => {},
});

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('autodb_unit_system') as UnitSystem;
      if (saved === 'metric' || saved === 'imperial') {
        setUnitSystemState(saved);
      }
    } catch {}
  }, []);

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
    try {
      localStorage.setItem('autodb_unit_system', system);
    } catch {}
  };

  const toggleUnitSystem = () => {
    const next = unitSystem === 'metric' ? 'imperial' : 'metric';
    setUnitSystem(next);
  };

  return (
    <UnitContext.Provider value={{ unitSystem, toggleUnitSystem, setUnitSystem }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnits() {
  return useContext(UnitContext);
}
