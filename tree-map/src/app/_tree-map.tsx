'use client';

import dynamic from 'next/dynamic';
import { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { OverrideHTMLInputContextProvider, TreeMapContext } from './_context';
import {
  Map as GoogleMap,
  AdvancedMarker,
  useMap,
  Pin,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useIsMobile } from './hooks';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import treePinGreen from './constants/tree-pin-green';
import treePinWhite from './constants/tree-pin-white';

const AddTreeRequestForm = dynamic(() => import('./_add-tree-request-form'), {
  ssr: false,
});

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
  const markerLib = useMapsLibrary('marker');

  const { markers } = useContext(TreeMapContext);
  const [currentPin, setCurrentPin] = useState<ReactElement | null>(null);

  const onPlaceSelected = useCallback(
    (place: google.maps.places.PlaceResult | null) => {
      if (!map) return;
      if (!place?.geometry?.location) return;

      map.setTilt(0);
      const zoom = map.getZoom();
      if (zoom && zoom < 20) {
        map.setZoom(20);
      }

      // Drop a pin at location
      setCurrentPin(
        <AdvancedMarker
          key="current-pin"
          position={{
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }}
        >
          <Pin background="#000" borderColor="#000" glyphColor="#fff" glyph="•" scale={1} />
        </AdvancedMarker>,
      );
    },
    [map],
  );

  const onPlaceSelectedFromAddress = useCallback(
    (place: google.maps.places.PlaceResult | null) => {
      if (!map) return;
      if (!place?.geometry?.location) return;

      map.setTilt(0);
      map.setZoom(20);
      map.setCenter(place.geometry.location);

      onPlaceSelected(place);
    },
    [map, onPlaceSelected],
  );

  const [currentXMark, setCurrentXMark] = useState<{ lat: number; lng: number } | null>(null);

  const reverseGeocode = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      setCurrentXMark({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      // reverse geocode
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: event.latLng }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          onPlaceSelected(results[0]);
          setOverriddenInputValue(results[0].formatted_address.replace(/(Chicago, IL).+/, '$1'));
        }
      });
    },
    [onPlaceSelected],
  );

  const [overriddenInputValue, setOverriddenInputValue] = useState<string | null>(null);
  useEffect(() => {
    map?.addListener('contextmenu', reverseGeocode);
  }, [map, reverseGeocode]);

  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);

  const AdvancedMarkerElement = markerLib?.AdvancedMarkerElement;

  useEffect(() => {
    if (!map) return;
    if (!markerLib) return;
    if (!AdvancedMarkerElement) return;

    if (clusterer) {
      clusterer.clearMarkers();
    }

    const markersForClusterer: google.maps.marker.AdvancedMarkerElement[] = [];
    markers.forEach((marker) => {
      if (marker.latitude && marker.longitude) {
        markersForClusterer.push(
          new AdvancedMarkerElement({
            position: {
              lat: marker.latitude,
              lng: marker.longitude,
            },
            title: marker.address,
            content: new DOMParser().parseFromString(treePinGreen, 'text/html').body
              .firstChild as HTMLElement,
          }),
        );
      }
      if (
        typeof marker.lat !== 'undefined' &&
        Number.isFinite(marker.lat) &&
        typeof marker.lng !== 'undefined' &&
        Number.isFinite(marker.lng)
      ) {
        console.log('adding tree pin', marker);
        markersForClusterer.push(
          new AdvancedMarkerElement({
            position: {
              lat: marker.lat,
              lng: marker.lng,
            },
            title: 'Tree Location',
            content: new DOMParser().parseFromString(treePinWhite, 'text/html').body
              .firstChild as HTMLElement,
          }),
        );
      }
    });

    const newClusterer = new MarkerClusterer({
      map,
      markers: markersForClusterer,
      algorithmOptions: {
        maxZoom: 10,
      },
      renderer: {
        render: ({ count, position }) => {
          const clusterMarker = new AdvancedMarkerElement({
            position,
            content: new DOMParser().parseFromString(
              `<div style="
                background: rgba(0, 70, 0, 0.8);
                border: 2px solid rgba(0, 20, 0, 0.8);
                border-radius: 50%;
                padding: 12px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                width: 40px;
                height: 40px;
              ">${count}</div>`,
              'text/html',
            ).body.firstChild as HTMLElement,
          });
          return clusterMarker;
        },
      },
    });

    if (!clusterer) {
      setClusterer(newClusterer);
    }

    return () => {
      newClusterer.clearMarkers();
    };
  }, [map, markers, AdvancedMarkerElement, markerLib, clusterer]);

  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          {currentPin}
          {currentXMark && (
            <AdvancedMarker
              key="current-x-mark"
              position={{ lat: currentXMark.lat, lng: currentXMark.lng }}
            >
              <div dangerouslySetInnerHTML={{ __html: treePinWhite }} style={{ opacity: 0.7 }} />
            </AdvancedMarker>
          )}
        </GoogleMap>
      )}
      <OverrideHTMLInputContextProvider value={overriddenInputValue}>
        <div className={mounted ? 'opacity-100' : 'opacity-0'}>
          <AddTreeRequestForm
            onPlaceSelected={onPlaceSelectedFromAddress}
            lat={currentXMark?.lat}
            lng={currentXMark?.lng}
          />
        </div>
      </OverrideHTMLInputContextProvider>
    </>
  );
}
