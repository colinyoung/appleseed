import { Suspense } from 'react';
import Content from './_content';
import { TreeMapContextProvider } from './_context';
import { getMarkers } from './_functions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const markers = await getMarkers();

  return (
    <main className="flex-1 flex-col h-screen w-full">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen bg-black">Loading...</div>
        }
      >
        <TreeMapContextProvider markers={markers}>
          <Content />
        </TreeMapContextProvider>
      </Suspense>
    </main>
  );
}
