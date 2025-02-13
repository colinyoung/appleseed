'use client';

import cn from 'clsx';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { TreeMapContext } from './_context';
import { Marker } from '../../types';
import { geocodeAddress } from './api/tree-requests/_client-functions';
import { PlaceAutocompleteClassic } from './_visgl-autocomplete';
import Link from 'next/link';
import Image from 'next/image';
import { useIsMobile } from './hooks';
import { trackEvent } from './api/tree-requests/_utils';

type TreeRequestResult = {
  srNumber: string;
  address: string;
  numTrees: number;
  location: string;
  lat: number;
  lng: number;
  alreadyExists?: boolean;
};

async function submitForm(e: React.FormEvent<HTMLFormElement>): Promise<TreeRequestResult> {
  e.preventDefault();
  const formElement = e.target as HTMLFormElement;
  const address = formElement.address.value;
  const numTrees = formElement.numTrees.value;
  const location = formElement.location.value;
  const lat = formElement.lat.value;
  const lng = formElement.lng.value;
  localStorage.setItem('hasOnboarded', 'true');
  const result = await createTreeRequest({ address, numTrees, location, lat, lng });
  if (typeof window !== 'undefined') {
    const treeCount = parseInt(localStorage.getItem('treeCount') || '0');
    localStorage.setItem('treeCount', (treeCount + 1).toString());
  }
  return result;
}

export default function AddTreeRequestForm({
  onPlaceSelected,
  lat,
  lng,
}: {
  onPlaceSelected: (place: google.maps.places.PlaceResult | null) => void;
  lat?: number;
  lng?: number;
}) {
  const [numTrees, setNumTrees] = useState(1);
  const [treeCount, setTreeCount] = useState(0);
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
  const messages = useMemo(
    () => [
      'Starting...',
      'Starting...',
      'Verifying address...',
      'Verifying address...',
      'Verifying address...',
      'Submitting...',
      'Submitting...',
      'Submitting...',
    ],
    [],
  );
  const [statusMessage, setStatusMessage] = useState('');
  useEffect(() => {
    let index = 0;
    if (submitting) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return prev;
          }
          return Math.min(prev + 10, 95);
        });
        setStatusMessage(messages[index] ?? 'Finalizing...');
        index++;
      }, 1250);

      return () => clearInterval(interval);
    }
    if (!submitting) {
      setStatusMessage('');
      index = 0;
      setProgress(0);
    }
  }, [submitting, messages]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      setSubmitting(true);
      trackEvent('add_tree_request_started');
      try {
        setHasOnboarded(true);
        const result = await submitForm(e);
        setSubmitting(false);

        if (result.alreadyExists) {
          trackEvent('add_tree_request_already_exists');
          toast.warning('Tree request already exists. Please try again.');
          return;
        }
        if (!result.srNumber) {
          trackEvent('add_tree_request_failed');
          toast.error('Failed to create tree request. Please try again.');
          return;
        }

        setTreeCount((prev) => prev + 1);
        if (typeof window !== 'undefined') {
          localStorage.setItem('treeCount', (treeCount + 1).toString());
        }

        const geocodedLocation = await geocodeAddress(result.address);
        if (!geocodedLocation) return;

        const newMarker: Marker = {
          address: result.address,
          numTrees: result.numTrees,
          location: result.location,
          longitude: geocodedLocation.longitude,
          latitude: geocodedLocation.latitude,
          lat: lat,
          lng: lng,
        };

        setMarkers((prevMarkers: Marker[]) => [...prevMarkers, newMarker]);

        trackEvent('add_tree_request_success', {
          srNumber: result.srNumber,
        });
        toast.success('Tree request created! SR Number: ' + result.srNumber);
        // Reset form
        setNumTrees(1);
        setLocation('Parkway');
      } catch (error: unknown) {
        trackEvent('add_tree_request_failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        toast.error(`Failed to create tree request! The address was likely invalid.`);
      } finally {
        setSubmitting(false);
      }
    },
    [setMarkers, lat, lng, treeCount],
  );

  const [collapsed, setCollapsed] = useState(false);

  const isMobile = useIsMobile();

  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboardedStatus = localStorage.getItem('hasOnboarded') === 'true';
      if (!onboardedStatus) {
        trackEvent('onboarding_viewed');
      }
      setHasOnboarded(onboardedStatus);
    }
  }, []);

  useEffect(() => {
    const savedCount = localStorage.getItem('treeCount');
    if (savedCount) {
      setTreeCount(parseInt(savedCount));
    }
  }, []);

  return (
    <div className="md:absolute md:right-6 md:top-6 md:bottom-18 md:max-h-[90vh]">
      <div
        className={cn(
          'flex bg-green-900 flex-col p-6 w-full md:w-[500px] md:border-2 md:border-green-800 md:rounded-lg md:shadow-lg',
          'md:max-h-full md:h-full overflow-y-auto',
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

              <h1 className="text-xl font-bold text-white">Create tree requests for Chicago</h1>
            </div>
            <p className="text-md text-gray-300">
              {isMobile
                ? 'Search addresses to add tree requests. '
                : 'To add, zoom and right-click (or search). '}
              <Link className="text-white" href="/info">
                About...
              </Link>
            </p>
          </div>
          {!isMobile && (
            <button className="text-white" onClick={() => setCollapsed(!collapsed)}>
              [{collapsed ? '+' : '-'}]
            </button>
          )}
        </div>
        {isMobile && (
          <div className="mt-4 bg-orange-700 border-2 border-orange-600 rounded-lg p-2">
            <p>View on desktop for a much better experience and to see trees on a map.</p>
          </div>
        )}
        {!hasOnboarded && !isMobile && <Onboarding setHasOnboarded={setHasOnboarded} />}

        <form
          className={cn('mt-6 flex flex-col gap-2', collapsed ? 'hidden' : '')}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="text-sm font-bold text-white">
              Address
            </label>
            {googleLoaded && (
              <PlaceAutocompleteClassic
                inputClassName="w-full p-2 rounded-md text-black"
                onPlaceSelect={onPlaceSelected}
                disabled={submitting}
              />
            )}
            <p className="text-sm text-gray-300">
              You can check the address (and whether there&apos;s already a tree) by zooming in.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="numTrees" className="text-sm font-bold text-white">
              Number of Trees
            </label>
            <input
              type="number"
              name="numTrees"
              placeholder="Number of Trees"
              value={numTrees}
              onChange={(e) => setNumTrees(parseInt(e.target.value))}
              className="w-full p-2 rounded-md text-black"
              disabled={submitting}
            />
            <p className="text-sm text-gray-300">
              Only request more than one tree if you have a specific reason (i.e. building is on a
              corner)
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="text-sm font-bold text-white">
              Physical location
            </label>
            <input
              name="location"
              placeholder="Parkway"
              type="text"
              value={location}
              className="w-full p-2 rounded-md text-black"
              onChange={(e) => setLocation(e.target.value)}
              disabled={submitting}
            />
            <p className="text-sm text-gray-300">
              This is almost always best left as the default, &quot;Parkway&quot;, since that&apos;s
              what we call the city-owned area between the sidewalk and the street in Chicago.
            </p>
          </div>
          <input type="hidden" name="lat" value={lat === undefined ? '' : lat.toString()} />
          <input type="hidden" name="lng" value={lng === undefined ? '' : lng.toString()} />
          <div className="flex flex-row items-center gap-2 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'rounded-lg border border-[#00000099] text-white p-2 px-4 bg-gradient-to-b from-green-700 to-green-800 rounded-md w-fit',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {submitting ? (
                <div className="h-6 items-center flex w-[100px]">
                  <div className="w-full rounded-full h-2.5 bg-green-800">
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
            {statusMessage && (
              <span className="text-sm text-white/80 top-2 block">{statusMessage}</span>
            )}
          </div>
          {submitting && (
            <p className="flex text-sm text-white w-full">
              Requesting from 311...This could take ~10 seconds.
            </p>
          )}
          {treeCount > 0 && !submitting && (
            <div className="flex flex-row items-center gap-2 rounded-lg bg-green-800 p-2 mt-3">
              <span className="text-sm text-white/80 top-2 block font-bold">
                🌳 You&apos;ve added {treeCount} tree{treeCount === 1 ? '' : 's'}! Keep going!
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2 mt-4 border-t border-green-700 pt-2">
            {!isMobile && (
              <p className="mt-2 text-sm text-gray-300 font-bold mb-3">
                Key: <span className="text-white bg-[#003000] rounded-full p-1.5">🌳</span> = tree
                request,{' '}
                <span className="text-white bg-white rounded-full p-1">
                  <Image
                    src="/noun-shovel-7559822.svg"
                    alt="shovel"
                    width={16}
                    height={16}
                    style={{ display: 'inline' }}
                  />
                </span>{' '}
                ={' '}
                <abbr title="Positioning the shovel helps train our model to find trees!">
                  planting location
                </abbr>
              </p>
            )}
            <ul className="text-sm text-gray-300">
              <li className="mb-2">
                We have some{' '}
                <a className="text-white" href="/info#examples">
                  good examples of spots to plant here
                </a>
                .
              </li>
              <li className="mb-2">
                • Yes, you can request a tree on a sidewalk, but make sure the sidewalk is wide
                enough (6 feet). If so, they&apos;ll cut a hole.
              </li>
              <li className="mb-2">
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

async function createTreeRequest({
  address,
  numTrees,
  location,
  lat,
  lng,
}: {
  address: string;
  numTrees: number;
  location: string;
  lat: number;
  lng: number;
}): Promise<TreeRequestResult> {
  const response = await fetch(`/api/tree-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address, numTrees, location, lat, lng }),
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}

function Onboarding({ setHasOnboarded }: { setHasOnboarded: (hasOnboarded: boolean) => void }) {
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const modalOpenTimeRef = useRef<number | null>(null);

  const handleCloseModal = () => {
    if (modalOpenTimeRef.current) {
      const timeWatched = Date.now() - modalOpenTimeRef.current;
      if (timeWatched >= 1000) {
        // 1 second in milliseconds
        setHasOnboarded(true);
      }
    }
    setIsVideoFullscreen(false);
  };

  useEffect(() => {
    if (isVideoFullscreen) {
      modalOpenTimeRef.current = Date.now();
    } else {
      modalOpenTimeRef.current = null;
    }
  }, [isVideoFullscreen]);

  return (
    <div className="mt-4 bg-blue-200 border-2 border-blue-600 rounded-lg p-2">
      <h3 className="text-lg font-bold text-black">How to use</h3>
      <p className="text-sm text-gray-900">Click the video below for a quick tutorial.</p>
      <div className="cursor-pointer py-2" onClick={() => setIsVideoFullscreen(true)}>
        <video src="/assets/create.mp4" muted loop className="w-full rounded-lg" />
      </div>
      <div className="flex flex-row justify-end items-center gap-2">
        <button
          className="bg-gray-800 text-white p-2 rounded-md"
          onClick={() => setIsVideoFullscreen(true)}
        >
          Open Video
        </button>
      </div>

      {isVideoFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={handleCloseModal}
        >
          <div className="w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <video
              src="/assets/create.mp4"
              muted
              loop
              autoPlay
              controls
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
