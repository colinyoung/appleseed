import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  },
};

export default nextConfig;
