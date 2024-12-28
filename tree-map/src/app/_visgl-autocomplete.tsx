import React, { useRef, useEffect, useState, useContext } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { OverrideHTMLInputContext } from './_context';

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  inputClassName?: string;
}

// This is an example of the classic "Place Autocomplete" widget.
// https://developers.google.com/maps/documentation/javascript/place-autocomplete
export const PlaceAutocompleteClassic = ({ onPlaceSelect, inputClassName }: Props) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  const { overriddenInputValue } = useContext(OverrideHTMLInputContext);
  useEffect(() => {
    if (overriddenInputValue) {
      if (inputRef.current) {
        inputRef.current.value = overriddenInputValue;
      }
    }
  }, [overriddenInputValue]);

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        className={inputClassName}
        autoComplete="off"
        name="address"
        onKeyDown={(e) => {
          // Prevent enter from submitting the form
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
};
