'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

interface Tree {
  id: number;
  latitude: number;
  longitude: number;
  species: string;
}

// Dynamically import the Map component to avoid SSR issues with Leaflet
const TreeMap = dynamic(() => import('../components/TreeMap'), {
  ssr: false,
});

export default function Home() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trees')
      .then((res) => res.json())
      .then((data) => {
        setTrees(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching trees:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Tree Planting Map</h1>
        <div className="h-[80vh] w-full">
          <TreeMap trees={trees} />
        </div>
      </div>
    </main>
  );
}