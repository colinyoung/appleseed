import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getTreeRequests() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, sr_number, street_address, location, latitude, longitude, num_trees, status, confirmed_planted FROM tree_requests',
    );
    client.release();
    return result.rows;
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
}

export async function geocodeAddress(
  address: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?address_line1=${address}, Chicago, IL&access_token=${process.env.MAPBOX_TOKEN}`,
  );
  const data = await response.json();
  if (data.features.length === 0) {
    return null;
  }
  const coordinates = data.features[0].geometry.coordinates;
  return { latitude: coordinates[1], longitude: coordinates[0] };
}

export async function updateTreeRequest(
  id: number,
  latLong: { latitude: number; longitude: number },
) {
  const client = await pool.connect();
  await client.query('UPDATE tree_requests SET latitude = $1, longitude = $2 WHERE id = $3', [
    latLong.latitude,
    latLong.longitude,
    id,
  ]);
  client.release();
}
