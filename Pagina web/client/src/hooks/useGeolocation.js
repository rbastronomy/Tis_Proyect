import { useState, useEffect, useCallback } from 'react';

export function useGeolocation({
  skip = false,
  enableHighAccuracy = true,
  timeout = 30000,
  maximumAge = 0,
  retryOnError = true,
  maxRetries = 3,
  validateAccuracy = null
} = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleSuccess = useCallback((pos) => {
    const newPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed,
      timestamp: pos.timestamp
    };

    // Si la precisión es muy mala (> 1000m), establecer error y detener
    if (newPosition.accuracy > 1000000) {
      setError('GPS signal too weak. Please check GPS settings and ensure you are outdoors.');
      setLoading(false);
      return;
    }

    // Validar precisión si se proporciona una función de validación
    if (validateAccuracy && !validateAccuracy(newPosition.accuracy)) {
      if (retryOnError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        return;
      }
      // Si se agotan los reintentos, usar la última posición disponible
      setPosition(newPosition);
      setLoading(false);
      return;
    }

    setPosition(newPosition);
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, [validateAccuracy, retryOnError, maxRetries, retryCount]);

  const handleError = useCallback((err) => {
    if (retryOnError && retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      return;
    }
    setError(err.message);
    setLoading(false);
  }, [retryOnError, maxRetries, retryCount]);

  useEffect(() => {
    if (skip) return;

    setLoading(true);
    let watchId;

    try {
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      );
    } catch (err) {
      setError('Geolocation not supported');
      setLoading(false);
      throw err;
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [
    skip,
    enableHighAccuracy,
    timeout,
    maximumAge,
    handleSuccess,
    handleError
  ]);

  return { position, error, loading };
}