import React, { useEffect, useRef } from "react";
import { geocodeByAddress, getLatLng } from "react-google-places-autocomplete";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { Controller } from "react-hook-form";

const COUNTRY_LABEL = {
  us: "USA",
  gb: "United Kingdom",
  ca: "Canada",
  ng: "Nigeria",
};

function componentName(components, type) {
  const match = components?.find((part) => part?.types?.includes(type));
  return match?.long_name || "";
}

function concatAddress({ street, city, state, postalcode, country, fallback }) {
  const parts = [street, city, state, postalcode, country].filter(Boolean);
  if (street && parts.length) return parts.join(", ");
  return (fallback || parts.join(", ")).trim();
}

export default function Location({
  setPersonalAddress,
  setAddress,
  setCity,
  setState,
  setPostal,
  setLocationInfo,
  register,
  control,
  errors,
  watch,
  setValue,
  country,
  registerVal,
  ..._rest
}: any) {
  const value = watch("addressContact");
  const typedRef = useRef("");
  const requestId = useRef(0);
  const applyStreet = setPersonalAddress || setAddress;

  const applyParsedAddress = (data) => {
    setLocationInfo(data);
    setCity(data?.city || "");
    applyStreet?.(data?.accuracy || "");
    setState(data?.state || "");
    if (registerVal === undefined) {
      setPostal(data?.postalcode || "");
    }
  };

  const applyFreeFormAddress = (raw) => {
    const trimmed = String(raw || "").trim();
    if (!trimmed) {
      applyParsedAddress({
        latitude: null,
        longitude: null,
        city: "",
        state: "",
        lga: "",
        postalcode: "",
        clearAddress: "",
        accuracy: "",
      });
      return;
    }

    const countryLabel = COUNTRY_LABEL[country] || "";
    const hasCountry =
      countryLabel && trimmed.toLowerCase().includes(countryLabel.toLowerCase());
    const concatenated =
      hasCountry || !countryLabel ? trimmed : `${trimmed}, ${countryLabel}`;

    applyParsedAddress({
      latitude: null,
      longitude: null,
      city: "",
      state: "",
      lga: "",
      postalcode: "",
      clearAddress: concatenated,
      accuracy: concatenated,
    });
  };

  const commitCustomOption = (field, text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;
    const option = {
      label: trimmed,
      value: { description: trimmed, place_id: "manual" },
    };
    field.onChange(option);
    applyFreeFormAddress(trimmed);
  };

  const getLatAndLong = async (address) => {
    const id = ++requestId.current;
    const fallback = String(address || "").trim();
    if (!fallback) return;

    try {
      const results = await geocodeByAddress(fallback);
      if (id !== requestId.current) return;

      const result = results?.[0];
      if (!result) {
        applyFreeFormAddress(fallback);
        return;
      }

      let lat = null;
      let lng = null;
      try {
        const coords = await getLatLng(result);
        lat = coords?.lat ?? null;
        lng = coords?.lng ?? null;
      } catch {
        lat = result?.geometry?.location?.lat?.() ?? null;
        lng = result?.geometry?.location?.lng?.() ?? null;
      }

      if (id !== requestId.current) return;

      const components = result.address_components || [];
      const streetNumber = componentName(components, "street_number");
      const route = componentName(components, "route");
      const street = [streetNumber, route].filter(Boolean).join(" ").trim();
      const city =
        componentName(components, "locality") ||
        componentName(components, "postal_town") ||
        componentName(components, "sublocality");
      const state = componentName(components, "administrative_area_level_1");
      const lga = componentName(components, "administrative_area_level_2");
      const countryName = componentName(components, "country");
      const postalcode = componentName(components, "postal_code");
      const formatted = result.formatted_address || fallback;
      const concatenated = concatAddress({
        street,
        city,
        state,
        postalcode,
        country: countryName,
        fallback: formatted,
      });

      applyParsedAddress({
        latitude: lat,
        city,
        longitude: lng,
        clearAddress: concatenated,
        lga,
        state,
        accuracy: concatenated,
        postalcode,
      });
    } catch {
      if (id !== requestId.current) return;
      applyFreeFormAddress(fallback);
    }
  };

  useEffect(() => {
    if (value?.label) {
      getLatAndLong(value.label);
    }
  }, [value]);

  return (
    <>
      <div>
        <Controller
          name={"addressContact"}
          className="form-control"
          style={{ borderRadius: "10px", height: "50px" }}
          control={control}
          {...register("addressContact", {
            required: false,
          })}
          render={({ field }) => (
            <GooglePlacesAutocomplete
              selectProps={{
                name: field.name,
                value: field.value || null,
                isDisabled: false,
                isClearable: true,
                placeholder: "Start typing your delivery address",
                noOptionsMessage: ({ inputValue }) =>
                  inputValue
                    ? `No matching address. Press Enter to use “${inputValue}”`
                    : "Type your delivery address",
                onChange: (option) => {
                  field.onChange(option);
                  if (!option) {
                    typedRef.current = "";
                    requestId.current += 1;
                    applyFreeFormAddress("");
                  }
                },
                onInputChange: (val, meta) => {
                  if (meta?.action === "input-change") {
                    typedRef.current = val;
                    requestId.current += 1;
                    applyFreeFormAddress(val);
                  }
                  return val;
                },
                onBlur: () => {
                  field.onBlur?.();
                  const typed = typedRef.current.trim();
                  if (typed && !value?.label) {
                    commitCustomOption(field, typed);
                  }
                },
                onKeyDown: (e) => {
                  if (e.key !== "Enter") return;
                  const typed = typedRef.current.trim();
                  if (!typed) return;
                  const focusedOption = document.querySelector(
                    '[id*="react-select"][id*="-option-"]'
                  );
                  if (focusedOption) return;
                  e.preventDefault();
                  commitCustomOption(field, typed);
                },
              }}
              apiKey="AIzaSyBbubeKt-xGh-XJ4XDkbjsunTha2hPhEYM"
              autocompletionRequest={{
                componentRestrictions: {
                  country: country ?? "ng",
                },
              }}
            />
          )}
        />
        <p className="text-xs text-slate-500 mt-2">
          If no suggestion appears, type the full address and continue.
        </p>
        {errors?.addressContact && <div>{errors?.addressContact}</div>}
      </div>
    </>
  );
}
