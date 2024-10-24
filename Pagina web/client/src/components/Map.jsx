import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -25.363,
  lng: 131.044
};

const apiKey = "AIzaSyCvWRK742f2k0o1CZ_POBNPygD5x-Tig_Js";

function Map() {
  const [position, setPosition] = useState(center);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setPosition(newPos);
        },
        (error) => {
          console.error("Error: ", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={10}
      >
        <Marker position={position} />
      </GoogleMap>
    </LoadScript>
  );
}

export default React.memo(Map);
