import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: '/appleseed/marker-icon.png',
  shadowUrl: '/appleseed/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Tree {
  id: number;
  latitude: number;
  longitude: number;
  species: string;
}

interface TreeMapProps {
  trees: Tree[];
}

export default function TreeMap({ trees }: TreeMapProps) {
  // Calculate center based on trees or default to a central location
  const center = trees.length > 0
    ? [
        trees.reduce((sum, tree) => sum + tree.latitude, 0) / trees.length,
        trees.reduce((sum, tree) => sum + tree.longitude, 0) / trees.length
      ]
    : [0, 0];

  return (
    <MapContainer
      center={[center[0], center[1]]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {trees.map((tree) => (
        <Marker
          key={tree.id}
          position={[tree.latitude, tree.longitude]}
          icon={icon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">Tree #{tree.id}</h3>
              <p>Species: {tree.species}</p>
              <p>Location: {tree.latitude}, {tree.longitude}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}