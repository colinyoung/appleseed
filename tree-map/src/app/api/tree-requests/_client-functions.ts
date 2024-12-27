export async function geocodeAddress(
  address: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address + ', Chicago, IL',
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
  );
  const data = await response.json();
  if (data.status !== 'OK') {
    return null;
  }
  if (!data.results || data.results.length === 0) {
    return null;
  }
  const location = data.results[0].geometry.location;
  return { latitude: location.lat, longitude: location.lng };
}
