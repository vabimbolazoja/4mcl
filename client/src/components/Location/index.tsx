import React, { useEffect } from "react";
import { geocodeByAddress, getLatLng } from "react-google-places-autocomplete";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import Geocode from "react-geocode";
import { Controller } from "react-hook-form";
export default Location = ({
  setPersonalAddress,
  setCity,
  setState,
  setPostal,
  setLocationInfo,
  register,
  control,
  errors,
  watch,
  setValue,country,
  registerVal,
}) => {

  const value = watch("addressContact");
  Geocode.setApiKey("AIzaSyBbubeKt-xGh-XJ4XDkbjsunTha2hPhEYM");
  Geocode?.setLanguage("en");
  Geocode?.setRegion("es");
  Geocode?.setLocationType("ROOFTOP");

  // Enable or disable logs. Its optional.
  Geocode?.enableDebug();

  useEffect(() => {
    if (value?.label) {
      getLatAndLong(value?.label);
    }
  }, [value]);

  const getLatAndLong = async (address) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then(({ lat, lng }) => {
        Geocode.fromLatLng(lat, lng).then(
          (response) => {
            const address = response.results[0].formatted_address;
            let city, state, postalcode, country, lga;
            for (
              let i = 0;
              i < response.results[0].address_components.length;
              i++
            ) {
              for (
                let j = 0;
                j < response?.results[0]?.address_components[i]?.types.length;
                j++
              ) {
                switch (response.results[0].address_components[i].types[j]) {
                  case "locality":
                    city =
                      response.results[0]?.address_components[2]?.long_name;
                    break;
                  case "administrative_area_level_1":
                    state =
                      response?.results[0]?.address_components[i]?.long_name;
                    break;
                  case "administrative_area_level_2":
                    lga =
                      response?.results[0]?.address_components[i]?.long_name;
                    break;
                  case "country":
                    country =
                      response?.results[0]?.address_components[i]?.long_name;
                    break;
                  case "postal_code":
                    postalcode =
                      response?.results[0]?.address_components[8]?.long_name;
                    break;
                }
              }
            }


            const data = {
              latitude: lat,
              city: city,
              longitude: lng,
              clearAddress: address,
              lga: lga,
              state: state,
              accuracy: address,
              postalcode: postalcode,
            };
            setLocationInfo(data);
            setCity(data?.city);
            setPersonalAddress(data?.accuracy);
            setValue('addressContact', '')
            setState(data?.state);
            if (registerVal === undefined) {
              setPostal(data.postalcode);
            }

          },
          (error) => {
            setCity("");
            setPersonalAddress("");
            setValue('addressContact', '')
            setState("");
            setLocationInfo({});
            if (registerVal === undefined) {
              setPostal("");
            }
          }
        );
      });
  };

  return (
    <>
      <div>
        <Controller
          name={'addressContact'}
          className="form-control"
          style={{ borderRadius: "10px", height: "50px" }}
          control={control}
          {...register("addressContact", {
            required: false,
          })}
          render={({ field }) => (
            <GooglePlacesAutocomplete
              selectProps={{
                isDisabled: false,
                field,
                onChange: field.onChange,
              }}
              apiKey="AIzaSyBbubeKt-xGh-XJ4XDkbjsunTha2hPhEYM"
               autocompletionRequest={{          // 👈 add this
                componentRestrictions: {
                  country: country ?? "ng",     // 👈 falls back to Nigeria if no prop passed
                },
              }}
            />
          )}
        />
        {errors?.addressContact &&
          <div>{errors?.addressContact}</div>}
      </div>
    </>
  );
};
