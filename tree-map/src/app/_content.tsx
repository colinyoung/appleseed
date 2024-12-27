'use client';

import TreeMap from './_tree-map';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function Content() {
  return (
    <APIProvider apiKey={process.env.GOOGLE_MAPS_API_KEY || ''}>
      <TreeMap />
    </APIProvider>
  );
}
