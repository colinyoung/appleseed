import Content from './_content';
import { TreeMapContextProvider } from './_context';
import { getMarkers } from './_functions';

export default async function Home() {
  const markers = await getMarkers();

  return (
    <main className="flex-1 flex-col h-screen w-full">
      <TreeMapContextProvider markers={markers}>
        <Content />
      </TreeMapContextProvider>
    </main>
  );
}
