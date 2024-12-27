'use client';

import { GoogleMap, Marker } from '@react-google-maps/api';
import AddTreeRequestForm from './_add-tree-request-form';
import { useRef } from 'react';

type MarkerProps = {
  latitude: number;
  longitude: number;
};

export default function TreeMap({ markers }: { markers: MarkerProps[] }) {
  const mapStyles = {
    height: '100%',
    width: '100%',
  };

  const defaultCenter = {
    lat: 41.8781,
    lng: -87.6298,
  };

  const mapRef = useRef<GoogleMap>(null);

  const onGeocoded = (location: google.maps.LatLngLiteral) => {
    const map = mapRef.current?.getInstance();
    if (!map) return;
    map.panTo(location);
    map.setTilt(0);
    map.setZoom(20);
  };

  return (
    <>
      <GoogleMap
        ref={mapRef}
        mapContainerStyle={mapStyles}
        zoom={12}
        center={defaultCenter}
        options={{
          mapTypeId: 'hybrid', // For satellite + streets view
        }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{
              lat: marker.latitude,
              lng: marker.longitude,
            }}
          />
        ))}
      </GoogleMap>
      <AddTreeRequestForm onGeocoded={onGeocoded} />
    </>
  );
}
