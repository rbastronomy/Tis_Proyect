import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@nextui-org/react'
import Map from '../../components/Map'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { io } from 'socket.io-client'

export const Route = createFileRoute('/taxi/')({
  component: Taxi,
})

function Taxi() {
  const [isTracking, setIsTracking] = useState(false)
  const [socket, setSocket] = useState(null)
  const { user } = useAuth()
  /////////////////////////////////////////////////////////// 
  
  const { position, error, loading } = useGeolocation({ 
    skip: !isTracking, 
    enableHighAccuracy: true, // Asegura que se use la mayor precisión posible
    timeout: 10000, // Limita el tiempo de espera para obtener la ubicación
    maximumAge: 5000,        // Usar cache de máximo 5 segundos
    distanceFilter: 2,      // Actualizar solo si se mueve más de 2 metros
    desiredAccuracy: 100     // Precisión deseada en metros
  })

  // Inicializar Socket.IO cuando comienza el tracking
  useEffect(() => {
    if (isTracking && !socket) {
      const newSocket = io('http://localhost:3000', {
        withCredentials: true,
        reconnection: true,           // Habilitar reconexión automática
        reconnectionAttempts: 5,      // Intentos de reconexión
        reconnectionDelay: 1000       // Delay entre intentos
      });

      newSocket.on('connect', () => {
        console.log('Socket conectado', newSocket.id);
        newSocket.emit('taxi:auth', { patente: user.patente });
      });

      newSocket.on('taxi:online', (data) => {
        console.log('Taxi online:', data);
      });

      newSocket.on('taxi:location', (data) => {
        console.log('Ubicación recibida:', data);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket desconectado - intentando reconectar...');
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconectado después de', attemptNumber, 'intentos');
        newSocket.emit('taxi:auth', { patente: user.patente }); // Re-autenticar
      });

      newSocket.on('connect_error', (error) => {
        console.error('Error de conexión:', error);
      });

      setSocket(newSocket);
    }

    // Cleanup
    return () => {
      if (socket) {
        socket.removeAllListeners();  // Remover todos los listeners antes de desconectar
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [isTracking, user.patente]);

  ///////////////////////////////////////////////////////////
  // Enviar ubicación cuando cambie
  useEffect(() => {
    if (socket && position && isTracking) {
      try {
        if (position.accuracy <= 100) {
          socket.volatile.emit('location:update', {
            patente: user.patente,
            ...position
          });
        } else {
          console.warn('Posición no enviada por baja precisión:', position.accuracy);
        }
      } catch (error) {
        console.error('Error al enviar posición:', error);
      }
    }
  }, [position, socket, user.patente, isTracking]);

  // Si no hay posición, se utiliza una posición predeterminada (Iquique)
  const mapPosition = position && position.latitude && position.longitude 
    ? { 
        lat: Number(position.latitude), // Asegurar que son números
        lon: Number(position.longitude)
      }
    : { 
        lat: -20.2133, // Posición por defecto (Iquique)
        lon: -70.1503 
      };

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
      console.log('Posición raw:', position);
      console.log('Posición procesada:', mapPosition);
    }
  }, [position]);

  useEffect(() => {
    // Cleanup cuando el componente se desmonte
    return () => {
      setIsTracking(false);
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        setSocket(null);
      }
    };
  }, []); // Solo se ejecuta al montar/desmontar

  return (
    <div className="relative min-h-screen">
      {/* Mapa de pantalla completa solo si mapPosition tiene valores válidos */}
      <div id="map-container" className="absolute inset-0 w-full h-full z-0">
        <Map 
          position={mapPosition} 
          isTracking={isTracking} 
          onPositionError={(error) => console.error('Error en mapa:', error)}
        />
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
            <p className={position.accuracy > 100 ? "text-red-500" : "text-green-500"}>
              Precisión: ±{position.accuracy.toFixed(0)}m
              {position.accuracy > 100 && " (Baja precisión)"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Taxi
