'use client';

import AddTreeRequestForm from './_add-tree-request-form';
import { ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { OverrideHTMLInputContextProvider, TreeMapContext } from './_context';
import { Map as GoogleMap, AdvancedMarker, useMap, Pin } from '@vis.gl/react-google-maps';
import { useIsMobile } from './hooks';

export default function TreeMap() {
  const mapStyles = {
    height: '100%',
    width: '100%',
    backgroundColor: 'black',
  };

  const defaultCenter = {
    lat: 41.8781,
    lng: -87.6298,
  };

  const map = useMap();

  const { markers } = useContext(TreeMapContext);
  const [currentPin, setCurrentPin] = useState<ReactElement | null>(null);

  const onPlaceSelected = useCallback(
    (place: google.maps.places.PlaceResult | null) => {
      if (!map) return;
      if (!place?.geometry?.location) return;

      map.panTo({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      map.setTilt(0);
      map.setZoom(20);

      // Drop a pin at location
      setCurrentPin(
        <AdvancedMarker
          key="current-pin"
          position={{
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }}
        >
          <Pin background="#000" borderColor="#000" glyphColor="#fff" glyph="M" scale={1} />
        </AdvancedMarker>,
      );
    },
    [map],
  );

  const [overriddenInputValue, setOverriddenInputValue] = useState<string | null>(null);
  useEffect(() => {
    map?.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      map?.setCenter(event.latLng);
      // reverse geocode
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: event.latLng }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          onPlaceSelected(results[0]);
          setOverriddenInputValue(results[0].formatted_address.replace(/(Chicago, IL).+/, '$1'));
        }
      });
    });
  }, [map, onPlaceSelected]);

  const renderedMarkers = useMemo(
    () =>
      markers
        .map((marker, index) =>
          marker.latitude && marker.longitude ? (
            <AdvancedMarker
              key={index}
              position={{
                lat: marker.latitude,
                lng: marker.longitude,
              }}
            />
          ) : null,
        )
        .filter((marker) => marker !== null),
    [markers],
  );

  const isMobile = useIsMobile();

  return (
    <>
      {!isMobile && (
        <GoogleMap
          mapId="49ae42fed52588c3"
          mapTypeId="hybrid"
          disableDefaultUI
          style={mapStyles}
          defaultZoom={12}
          defaultCenter={defaultCenter}
          gestureHandling="greedy"
        >
          {renderedMarkers.concat(currentPin ? [currentPin] : [])}
        </GoogleMap>
      )}
      <OverrideHTMLInputContextProvider value={overriddenInputValue}>
        <AddTreeRequestForm onPlaceSelected={onPlaceSelected} />
      </OverrideHTMLInputContextProvider>
    </>
  );
}
