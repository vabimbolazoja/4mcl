import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

const GOOGLE_API_KEY = "AIzaSyARhWcvd5RCPL2IOekI2NCLGIuA5AflZNo";

function loadScript(src, position, id) {
  if (!position) return;
  if (document.getElementById(id)) return;

  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("id", id);
  script.src = src;
  position.appendChild(script);
}

export default function AddressAutocomplete({ onSelect }) {
  const autoCompleteRef = useRef(null);
  const inputRef = useRef(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`,
      document.querySelector("head"),
      "google-maps"
    );

    const handleScriptLoad = () => {
      if (!window.google) return;
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { types: ["address"] }
      );
      autoCompleteRef.current.setFields([
        "address_components",
        "formatted_address",
        "geometry",
      ]);
      autoCompleteRef.current.addListener("place_changed", onPlaceChanged);
    };

    if (window.google && window.google.maps && window.google.maps.places) {
      handleScriptLoad();
    } else {
      window.initMap = handleScriptLoad;
    }

    return () => {
      if (autoCompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autoCompleteRef.current);
      }
    };
  }, []);

  function onPlaceChanged() {
    const place = autoCompleteRef.current.getPlace();
    if (!place.address_components) return;

    const components = place.address_components;

    const getComponent = (types) =>
      components.find((component) =>
        types.every((type) => component.types.includes(type))
      )?.long_name || "";

    const street_number = getComponent(["street_number"]);
    const route = getComponent(["route"]);
    const street = [street_number, route].filter(Boolean).join(" ").trim();

    const city =
      getComponent(["locality"]) ||
      getComponent(["sublocality"]) ||
      getComponent(["administrative_area_level_2"]);

    const state = getComponent(["administrative_area_level_1"]);
    const country = getComponent(["country"]);
    const postal_code = getComponent(["postal_code"]);

    const addressData = {
      street,
      city,
      state,
      country,
      postal_code,
      formatted_address: place.formatted_address,
      location: place.geometry?.location?.toJSON(),
    };

    setAddress(place.formatted_address);
    if (onSelect) onSelect(addressData);
  }

  return (
    <div>
      <Input
        ref={inputRef}
        placeholder="5224 Belleword Park Drive, Califonia"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={{ width: "100%", padding: "8px", fontSize: "1rem" }}
      />
    </div>
  );
}
