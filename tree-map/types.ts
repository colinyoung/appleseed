export type Marker = {
  longitude: number;
  latitude: number;
  address: string;
  numTrees: number;
  location: string;
  lat?: number;
  lng?: number;
};

export type TreeRequest = {
  id: number;
  street_address: string;
  latitude: number;
  longitude: number;
  num_trees: number;
  location: string;
  geocode_attempted: boolean;
  lat?: number;
  lng?: number;
};
