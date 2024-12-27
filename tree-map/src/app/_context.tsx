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
