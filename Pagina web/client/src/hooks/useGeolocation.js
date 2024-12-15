import { useState, useEffect, useCallback, useRef } from 'react';

export function useGeolocation({
  skip = false,
  enableHighAccuracy = true,
  timeout = 30000,
  maximumAge = 0,
  retryOnError = true,
  maxRetries = 3,
  validateAccuracy = null,
  minUpdateInterval = 1000 // Minimum time between updates in ms
}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const lastUpdateTime = useRef(0);
  const lastPosition = useRef(null);

  const handleSuccess = useCallback((pos) => {
    const now = Date.now();
    // Skip update if it's too soon after the last one
    if (now - lastUpdateTime.current < minUpdateInterval) {
      return;
    }

    const newPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed,
      timestamp: pos.timestamp
    };

    // Skip update if position hasn't changed significantly
    if (lastPosition.current) {
      const distance = Math.abs(
        lastPosition.current.latitude - newPosition.latitude +
        lastPosition.current.longitude - newPosition.longitude
      );
      if (distance < 0.00001) { // About 1 meter
        return;
      }
    }

    // If accuracy validation is provided
    if (validateAccuracy) {
      const isAccuracyValid = validateAccuracy(newPosition.accuracy);
      if (!isAccuracyValid) {
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setError(`GPS accuracy too low (${newPosition.accuracy.toFixed(0)}m)`);
          // Don't clear position if we already have one
          if (!position) {
            setPosition(null);
          }
          return;
        } else {
          // Log only when accuracy state changes
          if (!lastPosition.current || 
              lastPosition.current.accuracy !== newPosition.accuracy) {
            console.warn(`Using position despite low accuracy (${newPosition.accuracy.toFixed(0)}m)`);
          }
        }
      }
    }

    lastPosition.current = newPosition;
    lastUpdateTime.current = now;
    setPosition(newPosition);
    setError(null);
    setLoading(false);
    setRetryCount(0);
  }, [validateAccuracy, maxRetries, retryCount, position, minUpdateInterval]);

  const handleError = useCallback((err) => {
    // Only update error if it's different
    if (error?.message !== err.message) {
      setError(err.message);
      setPosition(null);
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    let watchId;
    try {
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [skip, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  return {
    position: position ? {
      lat: position.latitude,
      lon: position.longitude,
      accuracy: position.accuracy,
      speed: position.speed
    } : null,
    error,
    loading
  };
}