import { useState, useEffect, useCallback, useRef } from 'react';

export function useGeolocation({
  skip = false,
  enableHighAccuracy = true,
  timeout = 30000,
  maximumAge = 0,
  retryOnError = true,
  maxRetries = 3,
  minUpdateInterval = 1000,
  minAccuracy = 50,
  minDistance = 2,
  maxAge = 10000,
  accuracyLevels = {
    high: 20,
    medium: 50,
    low: 100
  }
}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const lastUpdateTime = useRef(0);
  const lastPosition = useRef(null);
  const watchId = useRef(null);

  const calculateDistance = useCallback((pos1, pos2) => {
    const R = 6371e3;
    const φ1 = (pos1.lat * Math.PI) / 180;
    const φ2 = (pos2.lat * Math.PI) / 180;
    const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
    const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const isValidPosition = useCallback((pos) => {
    if (!pos.coords || !pos.coords.latitude || !pos.coords.longitude || 
        isNaN(pos.coords.latitude) || isNaN(pos.coords.longitude)) {
      console.warn('Invalid coordinates received:', pos);
      return false;
    }

    if (Date.now() - pos.timestamp > maxAge) {
      console.warn('Position too old:', Date.now() - pos.timestamp);
      return false;
    }

    const accuracy = pos.coords.accuracy;
    if (accuracy > accuracyLevels.low) {
      console.warn(`Very poor accuracy: ${accuracy.toFixed(0)}m - Rejecting position`);
      return false;
    } else if (accuracy > accuracyLevels.medium) {
      console.info(`Low accuracy: ${accuracy.toFixed(0)}m - Using position with caution`);
    } else if (accuracy > accuracyLevels.high) {
      console.info(`Medium accuracy: ${accuracy.toFixed(0)}m`);
    }

    return true;
  }, [maxAge, accuracyLevels]);

  const handleSuccess = useCallback((pos) => {
    const now = Date.now();
    
    if (!isValidPosition(pos)) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        return;
      }
      setError(`Unable to get position with accuracy better than ${accuracyLevels.low}m`);
      return;
    }

    const newPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed || null,
      heading: pos.coords.heading || null,
      altitude: pos.coords.altitude || null,
      altitudeAccuracy: pos.coords.altitudeAccuracy || null,
      timestamp: pos.timestamp,
      accuracyLevel: pos.coords.accuracy <= accuracyLevels.high ? 'high' :
                    pos.coords.accuracy <= accuracyLevels.medium ? 'medium' : 'low'
    };

    if (now - lastUpdateTime.current < minUpdateInterval) {
      return;
    }

    if (lastPosition.current) {
      const distance = calculateDistance(lastPosition.current, newPosition);
      if (distance < minDistance) {
        return;
      }
    }

    lastPosition.current = newPosition;
    lastUpdateTime.current = now;
    setPosition(newPosition);
    setError(null);
    setLoading(false);
    setRetryCount(0);
  }, [maxRetries, retryCount, minUpdateInterval, minDistance, calculateDistance, isValidPosition, accuracyLevels]);

  const handleError = useCallback((err) => {
    console.error('Geolocation error:', err);
    if (error?.message !== err.message) {
      setError(err.message || 'Unknown geolocation error');
      setPosition(null);
      setLoading(false);

      if (retryOnError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
          }
          watchId.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy, timeout, maximumAge }
          );
        }, 1000);
      }
    }
  }, [error, retryOnError, maxRetries, retryCount, enableHighAccuracy, timeout, maximumAge]);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    try {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      );

      watchId.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
    } catch (err) {
      setError(err.message || 'Failed to initialize geolocation');
      setLoading(false);
    }

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [skip, handleSuccess, handleError, enableHighAccuracy, timeout, maximumAge]);

  return {
    position,
    error,
    loading,
    retryCount
  };
}