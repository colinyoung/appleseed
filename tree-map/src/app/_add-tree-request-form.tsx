'use client';

import cn from 'clsx';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { TreeMapContext } from './_context';
import { Marker } from '../../types';
import { geocodeAddress } from './api/tree-requests/_client-functions';
import { PlaceAutocompleteClassic } from './_visgl-autocomplete';

type TreeRequestResult = {
  srNumber: string;
  address: string;
  numTrees: number;
  location: string;
};

async function submitForm(e: React.FormEvent<HTMLFormElement>): Promise<TreeRequestResult> {
  e.preventDefault();
  const formElement = e.target as HTMLFormElement;
  const address = formElement.address.value;
  const numTrees = formElement.numTrees.value;
  const location = formElement.location.value;
  const result = await createTreeRequest(address, numTrees, location);
  return result;
}

export default function AddTreeRequestForm({
  onPlaceSelected,
}: {
  onPlaceSelected: (place: google.maps.places.PlaceResult | null) => void;
}) {
  const [numTrees, setNumTrees] = useState(1);
  const [location, setLocation] = useState('Parkway');
  const [submitting, setSubmitting] = useState(false);
  const { setMarkers } = useContext(TreeMapContext);

  const [googleLoaded, setGoogleLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (googleLoaded) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      if (window.google) {
        setGoogleLoaded(true);
      }
    }, 100);
  }, [googleLoaded]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      setSubmitting(true);
      try {
        const result = await submitForm(e);
        setSubmitting(false);

        const geocodedLocation = await geocodeAddress(result.address);
        if (!geocodedLocation) return;

        const newMarker: Marker = {
          address: result.address,
          numTrees: result.numTrees,
          location: result.location,
          longitude: geocodedLocation.longitude,
          latitude: geocodedLocation.latitude,
        };

        setMarkers((prevMarkers: Marker[]) => [...prevMarkers, newMarker]);

        toast.success('Tree request created! SR Number: ' + result.srNumber);
      } catch (error: unknown) {
        toast.error(
          `Failed to create tree request. ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        setSubmitting(false);
      }
    },
    [setMarkers],
  );

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute right-6 top-6 h-screen">
      <div className={cn('flex bg-green-700 dark:bg-green-900 flex-col p-6 w-[500px]')}>
        <div className="flex justify-between flex-row items-center mb-3">
          <h1 className="text-xl font-bold">Request a tree</h1>
          <button className="p-4" onClick={() => setCollapsed(!collapsed)}>
            [{collapsed ? '+' : '-'}]
          </button>
        </div>
        <form
          className={cn('flex flex-col gap-2', collapsed ? 'hidden' : '')}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            {googleLoaded && (
              <PlaceAutocompleteClassic
                inputClassName="w-full p-2 rounded-md text-black"
                onPlaceSelect={onPlaceSelected}
              />
            )}
            <p className="text-sm text-gray-500 dark:text-gray-300">
              You can check the address (and whether there&apos;s already a tree) by zooming in.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="number"
              name="numTrees"
              placeholder="Number of Trees"
              value={numTrees}
              onChange={(e) => setNumTrees(parseInt(e.target.value))}
              className="w-full p-2 rounded-md text-black"
            />
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Only request more than one tree if you have a specific reason (i.e. building is on a
              corner)
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <input
              name="location"
              placeholder="Location"
              type="text"
              value={location}
              className="w-full p-2 rounded-md text-black"
              onChange={(e) => setLocation(e.target.value)}
            />
            <p className="text-sm text-gray-500 dark:text-gray-300">
              This is almost always best left as the default, &quot;Parkway&quot;, since that&apos;s
              what we call the area between the sidewalk and the street in Chicago.
            </p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'rounded-lg border border-[#00000099] text-white mt-2 p-2 px-4 bg-gradient-to-b from-green-700 to-green-800 rounded-md w-fit',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            Add Tree Request
          </button>
          {submitting && (
            <p className="text-sm text-white">Requesting from 311...This could take ~10 seconds.</p>
          )}
          <div className="flex flex-col gap-2 mt-4 border-t border-green-700 pt-2">
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300 font-bold">Tips:</p>
            <ul className="text-sm text-gray-500 dark:text-gray-300">
              <li>• You can right-click on a house to prefill its address.</li>
              <li>• Yes, you can request a tree on a sidewalk. They&apos;ll cut a hole.</li>
              <li>
                • You might want to start in historically industrial neighborhoods, like the
                South/West Sides.
              </li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}

async function createTreeRequest(
  address: string,
  numTrees: number,
  location: string,
): Promise<TreeRequestResult> {
  const response = await fetch(`/api/tree-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address, numTrees, location }),
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}
