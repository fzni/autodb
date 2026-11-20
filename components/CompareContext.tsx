'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Vehicle } from '@/lib/types';

interface CompareContextType {
  compareVehicles: Vehicle[];
  toggleCompare: (vehicle: Vehicle) => boolean;
  removeFromCompare: (slug: string) => void;
  clearCompare: () => void;
  isInCompare: (slug: string) => boolean;
}

const CompareContext = createContext<CompareContextType>({
  compareVehicles: [],
  toggleCompare: () => false,
  removeFromCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
});

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareVehicles, setCompareVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('autodb_compare');
      if (saved) {
        setCompareVehicles(JSON.parse(saved));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const saveList = (list: Vehicle[]) => {
    setCompareVehicles(list);
    try {
      localStorage.setItem('autodb_compare', JSON.stringify(list));
    } catch (e) {}
  };

  const toggleCompare = (vehicle: Vehicle): boolean => {
    const exists = compareVehicles.some((v) => v.slug === vehicle.slug);
    if (exists) {
      const updated = compareVehicles.filter((v) => v.slug !== vehicle.slug);
      saveList(updated);
      return false;
    } else {
      if (compareVehicles.length >= 3) {
        alert('You can compare a maximum of 3 vehicles at once.');
        return false;
      }
      const updated = [...compareVehicles, vehicle];
      saveList(updated);
      return true;
    }
  };

  const removeFromCompare = (slug: string) => {
    const updated = compareVehicles.filter((v) => v.slug !== slug);
    saveList(updated);
  };

  const clearCompare = () => {
    saveList([]);
  };

  const isInCompare = (slug: string) => {
    return compareVehicles.some((v) => v.slug === slug);
  };

  return (
    <CompareContext.Provider
      value={{
        compareVehicles,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
