import { Pool } from 'pg';
import { Marker, TreeRequest } from '../../types';
import { geocodeAddress } from './api/tree-requests/_client-functions';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

export async function getTreeRequests(): Promise<TreeRequest[]> {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, sr_number, street_address, location, latitude, longitude, num_trees, status, confirmed_planted, geocode_attempted, lat, lng FROM tree_requests',
    );
    client.release();
    return result.rows;
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
}

export async function updateTreeRequest({
  id,
  latLong,
  geocodeAttempted,
}: {
  id: number;
  latLong?: { latitude: number; longitude: number };
  geocodeAttempted?: boolean;
}) {
  const client = await pool.connect();
  console.log(
    `Updating tree request ${id} with latLong ${latLong?.latitude}, ${latLong?.longitude} and geocodeAttempted ${geocodeAttempted}`,
  );
  if (latLong) {
    await client.query('UPDATE tree_requests SET latitude = $1, longitude = $2 WHERE id = $3', [
      latLong.latitude,
      latLong.longitude,
      id,
    ]);
  }
  await client.query('UPDATE tree_requests SET geocode_attempted = $1 WHERE id = $2', [
    geocodeAttempted,
    id,
  ]);
  client.release();
}

export async function getMarkers(): Promise<Marker[]> {
  const treeRequests = await getTreeRequests();
  const markers: Marker[] = await Promise.all(
    treeRequests.map(async (treeRequest: TreeRequest) => {
      // Already geocoded.
      if (treeRequest.latitude && treeRequest.longitude) {
        return {
          longitude: treeRequest.longitude,
          latitude: treeRequest.latitude,
          address: treeRequest.street_address,
          numTrees: treeRequest.num_trees,
          location: treeRequest.location,
          lat: treeRequest.lat,
          lng: treeRequest.lng,
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
      await updateTreeRequest({ id: treeRequest.id, latLong, geocodeAttempted: true });
      const marker: Marker = {
        ...latLong,
        address: treeRequest.street_address,
        numTrees: treeRequest.num_trees,
        location: treeRequest.location,
        lat: treeRequest.lat,
        lng: treeRequest.lng,
      };
      return marker;
    }),
  ).then((results) => results.filter((marker) => marker !== null));
  return markers;
}
