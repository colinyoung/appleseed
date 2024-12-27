import { Suspense } from 'react';
import Content from './_content';
import { TreeMapContextProvider } from './_context';
import { getMarkers } from './_functions';

export default async function Home() {
  const markers = await getMarkers();
  console.log('Markers', markers.length);

  return (
    <main className="flex-1 flex-col h-screen w-full">
      <Suspense fallback={<div>Loading...</div>}>
        <TreeMapContextProvider markers={markers}>
          <Content />
        </TreeMapContextProvider>
      </Suspense>
    </main>
  );
}

export const dynamic = 'force-dynamic';
