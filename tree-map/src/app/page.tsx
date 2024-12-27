import 'mapbox-gl/dist/mapbox-gl.css';
import TreeMap from './_tree-map';
import { MarkerProps } from 'react-map-gl';
import { geocodeAddress, getTreeRequests, updateTreeRequest } from './functions';

export default async function Home() {
  const treeRequests = await getTreeRequests();
  const markers: MarkerProps[] = await Promise.all(
    treeRequests.map(async (treeRequest) => {
      if (treeRequest.latitude && treeRequest.longitude) {
        return {
          longitude: treeRequest.longitude,
          latitude: treeRequest.latitude,
        };
      }
      const coordinates = await geocodeAddress(treeRequest.street_address);
      if (!coordinates) {
        return null;
      }
      const latLong = {
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
      };
      await updateTreeRequest(treeRequest.id, latLong);
      return latLong;
    }),
  ).then((results) => results.filter((marker): marker is MarkerProps => marker !== null));
  return (
    <main className="flex-1 flex-col h-screen w-full">
      <TreeMap markers={markers} />
    </main>
  );
}
