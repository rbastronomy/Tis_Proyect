import { useState, useEffect, useCallback, useRef } from 'react';

export function useGeolocation({
  skip = false,
  maxRetries = 3,
}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const lastUpdateTime = useRef(0);
  const lastPosition = useRef(null);

  const handleSuccess = useCallback((pos) => {
    const now = Date.now();
    
    // Validate and transform coordinates immediately
    if (!pos.coords || !pos.coords.latitude || !pos.coords.longitude || 
        isNaN(pos.coords.latitude) || isNaN(pos.coords.longitude)) {
      console.warn('Invalid coordinates received:', pos);
      return;
    }

    const newPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      timestamp: pos.timestamp
    };

    // Skip positions with very poor accuracy (> 100 meters)
    if (newPosition.accuracy > 100) {
      console.warn(`Poor accuracy (${newPosition.accuracy.toFixed(0)}m) - Skipping update`);
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        return;
      }
    }

    // Skip if position hasn't changed significantly (< 2 meters)
    if (lastPosition.current) {
      const distance = Math.sqrt(
        Math.pow(lastPosition.current.lat - newPosition.lat, 2) +
        Math.pow(lastPosition.current.lng - newPosition.lng, 2)
      ) * 111319.9; // Convert to meters

      if (distance < 2) {
        return;
      }
    }

    // Update position if it passed all validations
    lastPosition.current = newPosition;
    lastUpdateTime.current = now;
    setPosition(newPosition);
    setError(null);
    setLoading(false);
    setRetryCount(0);
  }, [maxRetries, retryCount]);

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
      enableHighAccuracy: true, // Always use high accuracy
      timeout: 30000,
      maximumAge: 0 // Don't use cached positions
    };

    let watchId;
    try {
      // Request position with high accuracy first
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      );

      // Then start watching position
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
  }, [skip, handleSuccess, handleError]);

  return {
    position,
    error,
    loading
  };
}