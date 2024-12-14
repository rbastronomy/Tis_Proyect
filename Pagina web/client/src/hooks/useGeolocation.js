import { useState, useEffect } from 'react'

export function useGeolocation({ skip }) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (skip) return;

    setLoading(true);
    let watchId;

    const onSuccess = (pos) => {
      const { latitude, longitude, accuracy, speed } = pos.coords;
      
      // Solo actualizar si la precisión es aceptable (< 100 metros)
      if (accuracy <= 100) {
        setPosition({
          latitude,
          longitude,
          accuracy,
          speed,
          timestamp: pos.timestamp
        });
        setError(null);
      } else {
        console.warn(`Precisión insuficiente: ${accuracy}m`);
      }
      setLoading(false);
    };

    const onError = (err) => {
      setError(err.message);
      setLoading(false);
    };

    try {
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,  // Forzar alta precisión
        timeout: 10000,
        maximumAge: 2000,         // Datos de máximo 2 segundos de antigüedad
      });
    } catch (error) {
      setError('Error al iniciar geolocalización: ' + error.message);
      setLoading(false);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [skip]);

  return { position, error, loading };
}