import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@nextui-org/react'
import Map from '../../components/Map'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/taxi/')({
  component: Taxi,
})

function Taxi() {
  const [isTracking, setIsTracking] = useState(false)
  const { position, error, loading } = useGeolocation({ 
    skip: !isTracking, 
    enableHighAccuracy: true, // Asegura que se use la mayor precisión posible
    timeout: 10000 // Limita el tiempo de espera para obtener la ubicación
  })

  // Si no hay posición, se utiliza una posición predeterminada (Iquique)
  const mapPosition = position && position.latitude && position.longitude 
    ? { lat: position.latitude, lon: position.longitude }
    : { lat: -20.2133, lon: -70.1503 }  // Iquique como fallback

  const handleTrackingToggle = () => {
    if (!isTracking) {
      navigator.permissions?.query({ name: 'geolocation' })
        .then(permissionStatus => {
          if (permissionStatus.state === 'granted') {
            setIsTracking(true)
          } else if (permissionStatus.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(
              () => setIsTracking(true),
              (error) => {
                console.error('Error de permiso:', error)
                setIsTracking(false)
              }
            )
          } else {
            console.error('Permiso de geolocalización denegado')
            setIsTracking(false)
          }
        })
        .catch(error => {
          console.error('Error al consultar permisos:', error)
          setIsTracking(true)
        })
    } else {
      setIsTracking(false)
    }
  }

  useEffect(() => {
    if (position) {
      console.log('Posición obtenida:', position)
    }
  }, [position])

  return (
    <div className="relative min-h-screen">
      {/* Mapa de pantalla completa solo si mapPosition tiene valores válidos */}
      <div id="map-container" className="absolute inset-0 w-full h-full z-0">
        <Map position={mapPosition} isTracking={isTracking} />
      </div>

      {/* Botón de seguimiento centrado en la parte superior */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Button 
          color={isTracking ? "danger" : "primary"}
          onClick={handleTrackingToggle}
          isLoading={loading}
          className="px-6 py-3 text-lg font-bold rounded-full shadow-lg bg-blue-500 hover:bg-blue-700 text-white"
        >
          {loading ? 'Localizando...' : (isTracking ? 'Detener Seguimiento' : 'Iniciar Seguimiento')}
        </Button>
      </div>

      {/* Mensaje de error o datos de ubicación */}
      <div className="absolute bottom-4 left-4 z-10 text-white bg-black bg-opacity-70 p-4 rounded-md shadow-md max-w-xs">
        {error && (
          <div className="text-red-500 mb-2">
            {error}
          </div>
        )}
        {position && isTracking && (
          <div className="mt-2 text-sm">
            <p>Latitude: {position.latitude.toFixed(4)}</p>
            <p>Longitude: {position.longitude.toFixed(4)}</p>
            {position.speed && <p>Velocidad: {position.speed.toFixed(2)} m/s</p>}
            <p>Precisión: ±{position.accuracy.toFixed(0)}m</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Taxi
