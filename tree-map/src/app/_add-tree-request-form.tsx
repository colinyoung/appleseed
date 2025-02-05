'use client';

import cn from 'clsx';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { TreeMapContext } from './_context';
import { Marker } from '../../types';
import { geocodeAddress } from './api/tree-requests/_client-functions';
import { PlaceAutocompleteClassic } from './_visgl-autocomplete';
import Link from 'next/link';
import Image from 'next/image';
import { useIsMobile } from './hooks';
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

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (submitting) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return prev;
          }
          return Math.min(prev + 10, 95);
        });
      }, 1250);

      return () => clearInterval(interval);
    }
    if (!submitting) {
      setProgress(0);
    }
  }, [submitting]);

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
        setNumTrees(1);
        setLocation('Parkway');
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

  const isMobile = useIsMobile();

  return (
    <div className="md:absolute md:right-6 md:top-6">
      <div
        className={cn(
          'flex bg-green-700 dark:bg-green-900 flex-col p-6 w-full md:w-[500px] md:border-2 md:border-green-800 md:rounded-lg md:shadow-lg',
        )}
      >
        <div className="flex justify-between flex-row items-start">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <Image
                src="/dall-e-logo.png"
                alt="logo (tree in front of city of chicago skyline)"
                width={32}
                height={32}
              />

              <h1 className="text-xl font-bold">Create tree requests for Chicago</h1>
            </div>
            <p className="text-md text-gray-500 dark:text-gray-300">
              {isMobile
                ? 'Search addresses to add tree requests. '
                : 'Point, click, and search to add tree requests. '}
              <Link href="/info">More info</Link>
            </p>
          </div>
          {!isMobile && (
            <button onClick={() => setCollapsed(!collapsed)}>[{collapsed ? '+' : '-'}]</button>
          )}
        </div>
        {isMobile && (
          <div className="mt-4 bg-orange-700 border-2 border-orange-600 rounded-lg p-2">
            <p>View on desktop for a much better experience and to see trees on a map.</p>
          </div>
        )}
        <form
          className={cn('mt-6 flex flex-col gap-2', collapsed ? 'hidden' : '')}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="text-sm font-bold">
              Address
            </label>
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
            <label htmlFor="numTrees" className="text-sm font-bold">
              Number of Trees
            </label>
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
            <label htmlFor="location" className="text-sm font-bold">
              Physical location
            </label>
            <input
              name="location"
              placeholder="Parkway"
              type="text"
              value={location}
              className="w-full p-2 rounded-md text-black"
              onChange={(e) => setLocation(e.target.value)}
            />
            <p className="text-sm text-gray-500 dark:text-gray-300">
              This is almost always best left as the default, &quot;Parkway&quot;, since that&apos;s
              what we call the city-owned area between the sidewalk and the street in Chicago.
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
            {submitting ? (
              <div className="h-6 items-center flex w-[100px]">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-green-800">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              'Create Tree Request'
            )}
          </button>
          {submitting && (
            <p className="flex text-sm text-white w-full">
              Requesting from 311...This could take ~10 seconds.
            </p>
          )}
          <div className="flex flex-col gap-2 mt-4 border-t border-green-700 pt-2">
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300 font-bold">Tips:</p>
            <ul className="text-sm text-gray-500 dark:text-gray-300">
              <li>
                We have some <a href="/info#examples">good examples of spots to plant here</a>.
              </li>
              {!isMobile && <li>• You can right-click on a house to prefill its address.</li>}
              <li>
                • Yes, you can request a tree on a sidewalk, but make sure the sidewalk is wide
                enough (6 feet). If so, they&apos;ll cut a hole.
              </li>
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
