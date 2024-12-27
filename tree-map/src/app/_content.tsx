'use client';

import { LoadScript } from '@react-google-maps/api';
import TreeMap from './_tree-map';
import { Marker } from '../../types';

export default function Content({ markers }: { markers: Marker[] }) {
  return (
    <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY || ''} libraries={['places']}>
      <TreeMap markers={markers} />
    </LoadScript>
  );
}
