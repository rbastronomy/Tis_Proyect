import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@nextui-org/react'
import Map from '../../components/Map'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useState } from 'react'

export const Route = createFileRoute('/taxi/')({
  component: Taxi,
})

function Taxi() {
  const [isTracking, setIsTracking] = useState(false)
  const { position, error, loading } = useGeolocation({ 
    skip: !isTracking 
  })
  
  const mapPosition = position 
    ? [position.latitude, position.longitude]
    : null

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex flex-col items-center p-6">
        <h1 className="text-4xl font-bold mb-6">Bienvenido a Taxi Aeropuerto Tarapacá</h1>
        <div className="flex flex-col items-center mb-4">
          <Button 
            color={isTracking ? "danger" : "primary"}
            onClick={handleTrackingToggle}
            isLoading={loading}
            className="mb-4"
          >
            {loading ? 'Localizando...' : (isTracking ? 'Detener Seguimiento' : 'Iniciar Seguimiento')}
          </Button>

          {/* Mensajes de Estado */}
          {error && (
            <div className="text-red-500 mb-2 text-center max-w-md">
              {error}
            </div>
          )}

          {position && isTracking && (
            <div className="mt-2 text-center">
              <p>Latitude: {position.latitude.toFixed(4)}</p>
              <p>Longitude: {position.longitude.toFixed(4)}</p>
              {position.speed && <p>Velocidad: {position.speed.toFixed(2)} m/s</p>}
              <p>Precisión: ±{position.accuracy.toFixed(0)}m</p>
            </div>
          )}
        </div>
        <div id="map-container" className="w-full max-w-4xl">
          <Map 
            position={mapPosition} 
            isTracking={isTracking}
          />
        </div>
      </main>
    </div>
  )
}
