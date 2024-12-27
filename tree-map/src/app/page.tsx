import { Marker } from '../../types';
import Content from './_content';
import { geocodeAddress, getTreeRequests, updateTreeRequest } from './functions';

type TreeRequest = {
  id: number;
  street_address: string;
  latitude: number;
  longitude: number;
  num_trees: number;
  location: string;
  geocode_attempted: boolean;
};

export default async function Home() {
  const treeRequests = await getTreeRequests();
  const markers: Marker[] = await Promise.all(
    treeRequests.map(async (treeRequest: TreeRequest) => {
      if (treeRequest.latitude && treeRequest.longitude) {
        return {
          longitude: treeRequest.longitude,
          latitude: treeRequest.latitude,
          address: treeRequest.street_address,
          numTrees: treeRequest.num_trees,
          location: treeRequest.location,
        };
      }
      if (treeRequest.geocode_attempted) {
        return null;
      }
      const coordinates = await geocodeAddress(treeRequest.street_address);
      if (!coordinates) {
        await updateTreeRequest({ id: treeRequest.id, geocodeAttempted: true });
        return null;
      }
      const latLong = {
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
      };
      await updateTreeRequest({ id: treeRequest.id, latLong });
      return {
        ...latLong,
        address: treeRequest.street_address,
        numTrees: treeRequest.num_trees,
        location: treeRequest.location,
      };
    }),
  ).then((results) => results.filter((marker) => marker !== null));
  return (
    <main className="flex-1 flex-col h-screen w-full">
      <Content markers={markers} />
    </main>
  );
}
