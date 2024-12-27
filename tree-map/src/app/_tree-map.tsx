'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import Map, { Marker, MarkerProps } from 'react-map-gl';

function useColorScheme() {
  const [colorScheme, setColorScheme] = useState('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateScheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    updateScheme(mediaQuery); // Set initial value
    mediaQuery.addEventListener('change', updateScheme);

    return () => mediaQuery.removeEventListener('change', updateScheme);
  }, []);

  return colorScheme;
}

export default function TreeMap({ markers }: { markers: MarkerProps[] }) {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <Map
      mapboxAccessToken={process.env.MAPBOX_TOKEN}
      initialViewState={{
        longitude: -87.6298,
        latitude: 41.8781,
        zoom: 12,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11'}
    >
      {markers.map((marker, index) => (
        <Marker key={index} longitude={marker.longitude} latitude={marker.latitude} anchor="bottom">
          <div className="text-red-500 text-2xl">📍</div>
        </Marker>
      ))}
    </Map>
  );
}
