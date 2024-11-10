import { useState, useEffect, useRef, useMemo } from 'react'

// Add distance calculation using Haversine formula
function calculateDistance(coords1, coords2) {
  const toRad = (value) => (value * Math.PI) / 180
  const R = 6371e3 // Earth's radius in meters
  const lat1 = toRad(coords1.latitude)
  const lat2 = toRad(coords2.latitude)
  const deltaLat = toRad(coords2.latitude - coords1.latitude)
  const deltaLon = toRad(coords2.longitude - coords1.longitude)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

function throttle(func, delay) {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

export function useGeolocation(options = {}) {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hasInitialPosition, setHasInitialPosition] = useState(false)

  const positionBuffer = useRef([])
  const BUFFER_SIZE = 5

  const { skip = false, ...geolocationOptions } = options

  const throttledSetPosition = useMemo(
    () =>
      throttle((newPosition) => {
        positionBuffer.current.push(newPosition)
        if (positionBuffer.current.length > BUFFER_SIZE) {
          positionBuffer.current.shift()
        }

        const averagePosition = positionBuffer.current.reduce(
          (acc, pos) => ({
            latitude: acc.latitude + pos.latitude,
            longitude: acc.longitude + pos.longitude,
          }),
          { latitude: 0, longitude: 0 }
        )

        const averagedPosition = {
          latitude: averagePosition.latitude / positionBuffer.current.length,
          longitude: averagePosition.longitude / positionBuffer.current.length,
          timestamp: newPosition.timestamp,
          accuracy: newPosition.accuracy,
          speed: newPosition.speed,
          heading: newPosition.heading,
        }

        setPosition((prevPosition) => {
          if (prevPosition) {
            const distance = calculateDistance(prevPosition, averagedPosition)
            if (distance < 2) {
              return prevPosition
            }
          }
          return averagedPosition
        })

        if (!hasInitialPosition) {
          setHasInitialPosition(true)
          setLoading(false)
        }
        setError(null)
      }, 500),
    [hasInitialPosition]
  );

  useEffect(() => {
    let watchId = null

    if (skip) {
      setLoading(false)
      setPosition(null)
      setError(null)
      setHasInitialPosition(false)
      positionBuffer.current = []
      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId)
      }
    }

    function onSuccess(position) {
      const newPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        timestamp: position.timestamp,
      }

      throttledSetPosition(newPosition)
    }

    function onError(error) {
      let errorMessage = 'Error obteniendo la ubicación: '
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage +=
            'Permiso denegado. Por favor, habilita los servicios de ubicación en la configuración de tu navegador.'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Información de ubicación no disponible.'
          break
        case error.TIMEOUT:
          errorMessage += 'La solicitud ha expirado.'
          break
        default:
          errorMessage += error.message
      }
      setError(errorMessage)
      setLoading(false)
    }

    if (!navigator.geolocation) {
      setError('La geolocalización no es compatible con este navegador.')
      setLoading(false)
      return
    }

    setLoading(true)

    // Obtener la posición inicial
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    })

    // Iniciar la vigilancia de la posición
    watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000,
      ...geolocationOptions,
    })

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
      positionBuffer.current = []
    }
  }, [skip, geolocationOptions, throttledSetPosition])

  return { 
    position, 
    error, 
    loading: loading && !hasInitialPosition 
  }
}

// Remove or use the calculateDistance function if needed