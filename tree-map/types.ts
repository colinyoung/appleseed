export type Marker = {
  longitude: number;
  latitude: number;
  address: string;
  numTrees: number;
  location: string;
};

export type TreeRequest = {
  id: number;
  street_address: string;
  latitude: number;
  longitude: number;
  num_trees: number;
  location: string;
  geocode_attempted: boolean;
};
