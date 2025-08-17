import React, { useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import {Input} from "../../components/ui/input"
const libraries = ["places"];

const GooglePlacesAutocomplete = ({ setCurrentAddress, setAddObj }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyARhWcvd5RCPL2IOekI2NCLGIuA5AflZNo", // your key
    libraries,
  });

  useEffect(() => {
    if (isLoaded && !autocompleteRef.current && window.google && inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "ng" },
        fields: ["formatted_address", "geometry", "address_components"],
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (!place || !place.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setCurrentAddress?.(place.formatted_address);
        setAddObj?.({
          address: place.formatted_address,
          latitude: lat,
          longitude: lng,
        });
      });
    }
  }, [isLoaded]);

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder="Enter an address"
      style={{ width: "100%", padding: "10px" }}
    />
  );
};

export default GooglePlacesAutocomplete;
