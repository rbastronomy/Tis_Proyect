import { useState, useEffect, useRef, useMemo } from 'react';

// Haversine distance calculation
function calculateDistance(coords1, coords2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);
  const deltaLat = toRad(coords2.latitude - coords1.latitude);
  const deltaLon = toRad(coords2.longitude - coords1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

export function useGeolocation(options = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasInitialPosition, setHasInitialPosition] = useState(false);

  const positionBuffer = useRef([]);
  const BUFFER_SIZE = 5;
  const ACCURACY_THRESHOLD = 20; // meters
  const MINIMUM_DISTANCE = 2; // meters

  const { skip = false, ...geolocationOptions } = options;

  const throttledSetPosition = useMemo(
    () =>
      throttle((newPosition) => {
        // Only process if accuracy is acceptable
        if (newPosition.accuracy > ACCURACY_THRESHOLD) {
          console.warn(`Insufficient accuracy: ${newPosition.accuracy}m`);
          return;
        }

        positionBuffer.current.push(newPosition);
        if (positionBuffer.current.length > BUFFER_SIZE) {
          positionBuffer.current.shift();
        }

        // Calculate averaged position
        const averagePosition = positionBuffer.current.reduce(
          (acc, pos) => ({
            latitude: acc.latitude + pos.latitude,
            longitude: acc.longitude + pos.longitude,
          }),
          { latitude: 0, longitude: 0 }
        );

        const averagedPosition = {
          latitude: averagePosition.latitude / positionBuffer.current.length,
          longitude: averagePosition.longitude / positionBuffer.current.length,
          timestamp: newPosition.timestamp,
          accuracy: newPosition.accuracy,
          speed: newPosition.speed,
          heading: newPosition.heading,
        };

        setPosition((prevPosition) => {
          if (prevPosition) {
            const distance = calculateDistance(prevPosition, averagedPosition);
            if (distance < MINIMUM_DISTANCE) {
              return prevPosition;
            }
          }
          return averagedPosition;
        });

        if (!hasInitialPosition) {
          setHasInitialPosition(true);
          setLoading(false);
        }
        setError(null);
      }, 500),
    [hasInitialPosition]
  );

  useEffect(() => {
    let watchId = null;

    if (skip) {
      setLoading(false);
      setPosition(null);
      setError(null);
      setHasInitialPosition(false);
      positionBuffer.current = [];
      return;
    }

    function onSuccess(position) {
      const newPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        timestamp: position.timestamp,
      };

      throttledSetPosition(newPosition);
    }

    function onError(error) {
      let errorMessage = 'Error obtaining location: ';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Permission denied. Please enable location services in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Request timed out.';
          break;
        default:
          errorMessage += error.message;
      }
      setError(errorMessage);
      setLoading(false);
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Get initial position
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      // Start watching position
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
        ...geolocationOptions,
      });
    } catch (error) {
      setError('Error initializing geolocation: ' + error.message);
      setLoading(false);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      positionBuffer.current = [];
    };
  }, [skip, geolocationOptions, throttledSetPosition]);

  return {
    position,
    error,
    loading: loading && !hasInitialPosition,
  };
}