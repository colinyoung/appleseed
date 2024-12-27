'use client';

import { Autocomplete } from '@react-google-maps/api';
import cn from 'clsx';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type TreeRequestResult = {
  srNumber: string;
  address: string;
  numTrees: number;
  location: string;
};

async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<TreeRequestResult> {
  e.preventDefault();
  const formElement = e.target as HTMLFormElement;
  const address = formElement.address.value;
  const numTrees = formElement.numTrees.value;
  const location = formElement.location.value;
  const result = await createTreeRequest(address, numTrees, location);
  return result;
}

export default function AddTreeRequestForm({
  onGeocoded,
}: {
  onGeocoded: (location: google.maps.LatLngLiteral) => void;
}) {
  const [numTrees, setNumTrees] = useState(1);
  const [location, setLocation] = useState('Parkway');
  const [submitting, setSubmitting] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const geocoder = new google.maps.Geocoder();
  const commitAddress = () => {
    const address = addressInputRef.current?.value;
    if (!address) return;
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const location = results[0].geometry.location;
        onGeocoded({ lat: location.lat(), lng: location.lng() });
      }
    });
  };

  return (
    <div className="absolute right-6 top-6 h-screen">
      <div className="flex bg-green-700 dark:bg-green-900 flex-col p-6 w-[500px]">
        <h1 className="text-xl font-bold mb-3">Request another tree</h1>
        <form
          className="flex flex-col gap-2"
          onSubmit={async (e) => {
            setSubmitting(true);
            try {
              const result = await handleSubmit(e);
              setSubmitting(false);
              toast.success(`Tree request submitted. SR Number: ${result.srNumber}`);
            } catch (error: unknown) {
              toast.error(
                `Failed to create tree request. ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="flex flex-col gap-2">
            <Autocomplete
              onLoad={(autocomplete) => {
                autocomplete.setFields(['address_components', 'formatted_address', 'geometry']);
              }}
              restrictions={{ country: 'us' }}
              onPlaceChanged={() => {
                commitAddress();
              }}
            >
              <input
                ref={addressInputRef}
                type="text"
                name="address"
                placeholder="Street Address"
                className="w-full p-2 rounded-md text-black"
              />
            </Autocomplete>
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
