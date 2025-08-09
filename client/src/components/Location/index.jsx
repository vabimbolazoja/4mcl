import React, { useState, useRef, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Input } from "../ui/input";

const libraries = ["places"];

const GooglePlacesAutocomplete = ({ setAddObj }) => {
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const autocompleteRef = useRef(null);
    const inputRef = useRef(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyARhWcvd5RCPL2IOekI2NCLGIuA5AflZNo", // Replace with your API Key
        libraries,
    });

 
    const initializeAutocomplete = () => {
        if (!inputRef.current || autocompleteRef.current) return;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ["address"],
            componentRestrictions: { country: "ng" },
        });

        autocompleteRef.current.addListener("place_changed", handlePlaceChanged);
    };

    const handlePlaceChanged = () => {
        if (!autocompleteRef.current) return;

        const place = autocompleteRef.current.getPlace();
        if (!place || !place.geometry) {
            console.warn("No geometry data found for the selected place.");
            return;
        }

        const newLatitude = place.geometry.location.lat();
        const newLongitude = place.geometry.location.lng();

        setAddress(place.formatted_address || place.name || "");
        setCurrentAddress(place.formatted_address || place.name || "");
        setLatitude(newLatitude);
        setLongitude(newLongitude);
        setAddObj((prevState) => ({
            ...prevState,
            address: place.formatted_address,
            latitude: newLatitude,
            longitude: newLongitude,
        }));
    };

    useEffect(() => {
        if (isLoaded && window.google) {
            initializeAutocomplete();
        }
    }, [isLoaded]);




    if (!isLoaded) return <div>Loading Addresses.</div>;

    return (
        <div>
            <div>

                <Input
                    name="address"
                    type="text"
                    ref={inputRef}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    id="autocomplete"
                    required
                    className="w-full"
                />
            </div>


        </div>
    );
};

export default GooglePlacesAutocomplete;