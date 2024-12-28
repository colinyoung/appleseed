import { Suspense } from 'react';
import Content from './_content';
import { TreeMapContextProvider } from './_context';
import { getMarkers } from './_functions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const markers = await getMarkers();

  // Server-side logging options:
  console.log('[Server] Markers count:', markers.length); // Shows in Vercel logs
  console.info('[Server] Markers loaded at:', new Date().toISOString()); // Shows in Vercel logs

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
