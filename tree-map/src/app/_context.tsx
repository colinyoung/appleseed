'use client';

import { createContext, useState } from 'react';
import { Marker } from '../../types';

export const TreeMapContext = createContext<{
  markers: Marker[];
  setMarkers: (markers: Marker[] | ((prevMarkers: Marker[]) => Marker[])) => void;
}>({
  markers: [],
  setMarkers: () => {},
});

export const TreeMapContextProvider = ({
  children,
  markers,
}: {
  children: React.ReactNode;
  markers: Marker[];
}) => {
  const [currentMarkers, setCurrentMarkers] = useState<Marker[]>(markers);
  return (
    <TreeMapContext.Provider value={{ markers: currentMarkers, setMarkers: setCurrentMarkers }}>
      {children}
    </TreeMapContext.Provider>
  );
};

export const OverrideHTMLInputContext = createContext<{
  overriddenInputValue: string | null;
  setOverriddenInputValue: (value: string | null) => void;
}>({
  overriddenInputValue: null,
  setOverriddenInputValue: () => {},
});

export const OverrideHTMLInputContextProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string | null;
}) => {
  return (
    <OverrideHTMLInputContext.Provider
      value={{ overriddenInputValue: value, setOverriddenInputValue: () => {} }}
    >
      {children}
    </OverrideHTMLInputContext.Provider>
  );
};
