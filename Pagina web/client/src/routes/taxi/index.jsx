import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, lazy, Suspense, useCallback, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Card } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Switch } from "@nextui-org/switch"
import { MapPin, Clock, User, Bell, Car } from 'lucide-react'
import { useDriverLocation } from '../../hooks/useDriverLocation'
import { WS_EVENTS } from '../../constants/WebSocketEvents'
import PropTypes from 'prop-types'
import { useNavigate } from '@tanstack/react-router'
import TaxiMarker from '../../components/TaxiMarker'
import { Polyline } from 'react-leaflet'
import { Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { calculateDistance, findClosestPointIndex } from '../../utils/geoUtils'

const Map = lazy(() => import('../../components/Map'))

export const Route = createFileRoute('/taxi/')({
  component: TaxiDashboard
})

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function TaxiDashboard() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, navigate])

  // 2. All useState hooks
  const [isOnline, setIsOnline] = useState(false)
  const [assignedBookings, setAssignedBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignedTaxi, setAssignedTaxi] = useState(null)
  const [taxiLoading, setTaxiLoading] = useState(true)
  const [activeTrip, setActiveTrip] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState(null)
  const [remainingRoute, setRemainingRoute] = useState(null)
  const [lastPosition, setLastPosition] = useState(null)

  // 3. Custom hooks
  const { 
    position, 
    error: geoError, 
    isConnected, 
    isConnecting, 
    isAuthenticated: isDriverAuthenticated,
    socket
  } = useDriverLocation({
    isOnline,
    driverId: user?.rut,
    patente: assignedTaxi?.patente,
    estado: activeTrip ? 'EN SERVICIO' : 'DISPONIBLE',
    onError: (error) => {
      console.log('Driver data:', {
        isOnline,
        driverId: user?.rut,
        patente: assignedTaxi?.patente,
        position
      });
      console.error('Driver location error:', error);
      if (error.message !== 'Socket connection not available') {
        setIsOnline(false);
      }
    }
  });

  // 4. All useEffect hooks
  useEffect(() => {
    const fetchAssignedTaxi = async () => {
      if (!user?.rut) return;

      try {
        setTaxiLoading(true);
        const response = await fetch(`/api/taxis/driver/${user.rut}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Error fetching assigned taxi');
        }

        const taxis = await response.json();
        
        const taxisArray = Array.isArray(taxis) ? taxis : [taxis].filter(Boolean);
        const assignedTaxi = taxisArray.find(taxi => 
          taxi && taxi.estado_taxi === 'EN SERVICIO'
        );

        console.log('Fetched taxis:', { taxis: taxisArray, assignedTaxi });
        setAssignedTaxi(assignedTaxi || null);
      } catch (error) {
        console.error('Error:', error);
        setAssignedTaxi(null);
      } finally {
        setTaxiLoading(false);
      }
    };

    fetchAssignedTaxi();
  }, [user?.rut]);

  useEffect(() => {
    const fetchAssignedBookings = async () => {
      if (!user?.rut) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/bookings/driver/${user.rut}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Error fetching bookings');
        }

        const data = await response.json();
        // Filter bookings for current day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayBookings = (data.reservas || []).filter(booking => {
          const bookingDate = new Date(booking.fecha_reserva);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime();
        });

        setAssignedBookings(todayBookings);

        // Find any CONFIRMADO booking and set it as active
        const confirmedBooking = todayBookings.find(
          booking => booking.estado_reserva === 'CONFIRMADO'
        );

        if (confirmedBooking) {
          // Geocode the origin address to get coordinates
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?` +
            `address=${encodeURIComponent(confirmedBooking.origen_reserva)}` +
            `&components=country:CL|administrative_area:Tarapacá|locality:Iquique|locality:Alto Hospicio` +
            `&key=${apiKey}`
          );

          if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json();
            if (geocodeData.status === 'OK' && geocodeData.results[0]) {
              const location = geocodeData.results[0].geometry.location;
              setActiveTrip({
                ...confirmedBooking,
                origen_lat: location.lat,
                origen_lng: location.lng
              });
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedBookings();
    const interval = setInterval(fetchAssignedBookings, 60000);
    return () => clearInterval(interval);
  }, [user?.rut]);

  // Add a ref to track the last fetch time and abort controller
  const lastFetchRef = useRef(0);
  const abortControllerRef = useRef(null);

  const fetchRoute = useCallback(
    debounce(async (currentPosition, currentTrip) => {
      if (!currentPosition || !currentTrip) return;

      // Cancel previous fetch if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Check if we should fetch (minimum 5 seconds between fetches)
      const now = Date.now();
      if (now - lastFetchRef.current < 5000) return;

      try {
        const origin = `${currentPosition.lat},${currentPosition.lng}`;
        const destination = `${currentTrip.origen_lat},${currentTrip.origen_lng}`;

        const response = await fetch(
          `/api/maps/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: abortControllerRef.current.signal
          }
        );

        if (!response.ok) {
          throw new Error(`Error en la respuesta: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'OK' && data.routes?.length > 0) {
          setRouteCoordinates(data.routes[0].decodedCoordinates);
          lastFetchRef.current = now;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Route fetch aborted');
        } else {
          console.error('Error al obtener la ruta:', error);
        }
      }
    }, 1000), // Reduced debounce time since we have other controls
    [] // Empty dependencies since we're using parameters
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Update the useEffect to use the debounced function
  useEffect(() => {
    if (position && activeTrip) {
      // Only fetch if we've moved more than 10 meters
      if (lastPosition) {
        const distanceMoved = calculateDistance(position, lastPosition);
        if (distanceMoved < 10) return;
      }
      fetchRoute(position, activeTrip);
    }
  }, [position, activeTrip, fetchRoute, lastPosition]);

  // Update useEffect for route tracking
  useEffect(() => {
    if (!position || !routeCoordinates || !activeTrip) return;

    // Initialize remaining route if not set
    if (!remainingRoute) {
      setRemainingRoute(routeCoordinates);
      setLastPosition(position);
      return;
    }

    // Only update if we've moved more than 10 meters
    const distanceMoved = calculateDistance(position, lastPosition);
    if (distanceMoved < 10) return;

    // Find closest point in remaining route
    const closestIndex = findClosestPointIndex(position, remainingRoute);
    
    // Remove passed points and keep a buffer of previous points
    const bufferSize = 3; // Keep 3 previous points for smooth rendering
    const newRemainingRoute = remainingRoute.slice(
      Math.max(0, closestIndex - bufferSize)
    );

    setRemainingRoute(newRemainingRoute);
    setLastPosition(position);

    // If we're close to destination (e.g., within 50 meters)
    if (calculateDistance(position, {
      lat: activeTrip.origen_lat,
      lng: activeTrip.origen_lng
    }) < 50) {
      // Handle arrival logic
      console.log('Arrived at pickup location');
    }
  }, [position, routeCoordinates, activeTrip]);

  // 5. Event handlers
  const handleOnlineToggle = async (checked) => {
    if (checked && !assignedTaxi) {
      console.error('No taxi assigned');
      return;
    }

    if (checked) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') {
          setIsOnline(true);
        } else if (permission.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(
            () => setIsOnline(true),
            (error) => {
              console.error('Geolocation error:', error);
              setIsOnline(false);
            }
          );
        } else {
          console.error('Geolocation permission denied');
          setIsOnline(false);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setIsOnline(false);
      }
    } else {
      setIsOnline(false);
      // Emit offline event when driver goes offline
      socket?.emit(WS_EVENTS.DRIVER_OFFLINE);
    }
  };

  const handleStartTrip = async (bookingId, bookingWithCoords) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/start-trip`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error starting trip');
      }

      const data = await response.json();

      // Update the booking state
      setAssignedBookings(prev => prev.map(booking => 
        booking.codigo_reserva === bookingId 
          ? { ...booking, estado_reserva: data.booking.estado_reserva }
          : booking
      ));

      // Set active trip with coordinates
      const updatedTrip = {
        ...bookingWithCoords,
        estado_reserva: data.booking.estado_reserva
      };
      console.log('Setting active trip with coords:', updatedTrip);
      setActiveTrip(updatedTrip);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleTripComplete = useCallback((bookingId, updatedBooking) => {
    setAssignedBookings(prev => prev.map(booking => 
      booking.codigo_reserva === bookingId 
        ? { ...booking, estado_reserva: updatedBooking.estado_reserva }
        : booking
    ));
    
    // Don't clear active trip immediately, just update its status
    if (activeTrip && activeTrip.codigo_reserva === bookingId) {
      setActiveTrip(prev => ({
        ...prev,
        estado_reserva: updatedBooking.estado_reserva
      }));
    }
    
    // Clear route data
    setRouteCoordinates(null);
    setRemainingRoute(null);
  }, [activeTrip]);

  const handlePickup = useCallback((bookingId, updatedBooking) => {
    console.log('Handling pickup for booking:', bookingId, 'Updated booking:', updatedBooking);
    
    // Update the booking in the list without removing it
    setAssignedBookings(prev => {
      console.log('Previous bookings:', prev);
      return prev.map(booking => {
        if (booking.codigo_reserva === bookingId) {
          console.log('Updating booking:', booking.codigo_reserva);
          return {
            ...booking,
            estado_reserva: 'RECOGIDO'
          };
        }
        return booking;
      });
    });
    
    // Update active trip with new status
    if (activeTrip && activeTrip.codigo_reserva === bookingId) {
      setActiveTrip(prev => ({
        ...prev,
        estado_reserva: 'RECOGIDO'
      }));
      
      // Fetch new route to destination if coordinates are available
      if (activeTrip.destino_lat && activeTrip.destino_lng) {
        fetchRoute({
          lat: position.lat,
          lng: position.lng
        }, {
          lat: activeTrip.destino_lat,
          lng: activeTrip.destino_lng
        });
      }
    }
  }, [activeTrip, position, fetchRoute]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold">Panel de Control - Conductor</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {user.nombre} {user.apellido}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Vehicle Information Card - Show at top on mobile */}
        <div className="md:hidden bg-white border-b">
          <VehicleCard taxi={assignedTaxi} loading={taxiLoading} />
        </div>

        {/* Map Section */}
        <div className="w-full md:flex-1 h-[calc(100vh-20rem)] md:h-[calc(100vh-4rem)]">
          <Suspense fallback={<div className="h-full flex items-center justify-center">Cargando mapa...</div>}>
            {console.log('Active Trip:', activeTrip)}
            {console.log('Route Coordinates:', routeCoordinates)}
            <Map 
              isTracking={isOnline} 
              position={position} 
              error={geoError}
            >
              {position && (
                <TaxiMarker 
                  data={{
                    lat: position.lat,
                    lng: position.lng,
                    patente: assignedTaxi?.patente || '',
                    estado: isOnline ? 'EN SERVICIO' : 'OFFLINE'
                  }}
                />
              )}
              {activeTrip && remainingRoute && (
                <Polyline 
                  positions={remainingRoute.map(coord => [coord.lat, coord.lng])}
                  color="blue"
                  weight={3}
                  opacity={0.7}
                />
              )}
              {activeTrip && activeTrip.origen_lat && activeTrip.origen_lng && (
                <Marker 
                  position={[activeTrip.origen_lat, activeTrip.origen_lng]}
                >
                  <Tooltip permanent>
                    Punto de recogida
                  </Tooltip>
                </Marker>
              )}
              {activeTrip && (
                <FitBounds 
                  position={position}
                  activeTrip={activeTrip}
                />
              )}
            </Map>
          </Suspense>
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-[350px] bg-white md:border-l flex flex-col max-h-[calc(100vh-4rem)]">
          {/* Vehicle Information - Desktop */}
          <div className="hidden md:block flex-shrink-0">
            <VehicleCard taxi={assignedTaxi} loading={taxiLoading} />
          </div>

          {/* Online/Offline Toggle */}
          <Card className="m-4 flex-shrink-0">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isOnline}
                    onChange={(e) => handleOnlineToggle(e.target.checked)}
                    isDisabled={!isConnected || !assignedTaxi}
                  />
                  <span className="text-sm font-medium">
                    {!assignedTaxi ? 'Sin vehículo asignado' :
                     isConnecting ? 'Conectando...' : 
                     !isConnected ? 'Desconectado' :
                     isOnline ? 'En Servicio' : 'Click para iniciar jornada'}
                  </span>
                </div>
                <div className={`h-3 w-3 rounded-full ${
                  !assignedTaxi ? 'bg-gray-500' :
                  isConnecting ? 'bg-blue-500 animate-pulse' :
                  !isConnected ? 'bg-red-500' :
                  isOnline ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
              </div>
              {geoError && (
                <div className="mt-2 text-sm text-red-500">
                  Error GPS: {geoError}
                </div>
              )}
              {position && (
                <div className="mt-2 text-xs text-gray-500">
                  Precisión GPS: ±{position.accuracy.toFixed(0)}m
                </div>
              )}
            </div>
          </Card>

          {/* Assigned Trips */}
          <Card className="m-4 flex-1 overflow-hidden flex flex-col">
            <div className="p-2 flex-shrink-0 border-b">
              <div className="flex items-center gap-1">
                <Bell className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Viajes Asignados Hoy</h2>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-2">Cargando viajes...</div>
            ) : assignedBookings.length === 0 ? (
              <div className="text-center py-2 text-gray-500">
                No hay viajes asignados para hoy
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 snap-y snap-mandatory scroll-smooth">
                {assignedBookings
                  .filter(booking => booking.estado_reserva !== 'COMPLETADO')
                  .sort((a, b) => new Date(a.fecha_reserva) - new Date(b.fecha_reserva))
                  .map((booking) => (
                    <div 
                      key={booking.codigo_reserva} 
                      className="snap-center p-1"
                    >
                      <TripCard
                        booking={booking}
                        onStartTrip={handleStartTrip}
                        onPickup={handlePickup}
                        onTripComplete={handleTripComplete}
                        className="w-full"
                      />
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function FitBounds({ position, activeTrip }) {
  const map = useMap();

  useEffect(() => {
    if (position && activeTrip) {
      const bounds = L.latLngBounds([
        [position.lat, position.lng],
        [activeTrip.origen_lat, activeTrip.origen_lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [position, activeTrip, map]);

  return null;
}

FitBounds.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  activeTrip: PropTypes.shape({
    origen_lat: PropTypes.number,
    origen_lng: PropTypes.number,
  })
};

function VehicleCard({ taxi, loading }) {
  if (loading) {
    return (
      <Card className="m-4">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!taxi) {
    return (
      <Card className="m-4">
        <div className="p-4">
          <div className="flex items-center gap-2 text-yellow-600">
            <Car className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Sin Vehículo Asignado</h2>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Contacte a un administrador para que le asigne un vehículo.
          </p>
        </div>
      </Card>
    );
  }

  const stateColors = {
    'DISPONIBLE': 'text-yellow-600', // Available to be assigned
    'EN SERVICIO': 'text-green-600', // Currently assigned
    'FUERA DE SERVICIO': 'text-red-600',
    'MANTENIMIENTO': 'text-yellow-600'
  };

  const stateMessages = {
    'DISPONIBLE': 'Vehículo disponible para asignación',
    'EN SERVICIO': 'Vehículo asignado y listo para operar',
    'FUERA DE SERVICIO': 'Vehículo no disponible',
    'MANTENIMIENTO': 'Vehículo en mantenimiento'
  };

  return (
    <Card className="m-4">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Car className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Vehículo Asignado</h2>
        </div>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Patente:</span> {taxi.patente}
          </p>
          <p className="text-sm">
            <span className="font-medium">Vehículo:</span> {taxi.marca} {taxi.modelo}
          </p>
          <p className="text-sm">
            <span className="font-medium">Color:</span> {taxi.color}
          </p>
          <p className="text-sm">
            <span className="font-medium">Año:</span> {taxi.ano}
          </p>
          <p className="text-sm">
            <span className="font-medium">Estado:</span>{' '}
            <span className={stateColors[taxi.estado_taxi] || 'text-gray-600'}>
              {taxi.estado_taxi}
            </span>
          </p>
          <p className="text-xs mt-2 italic">
            {stateMessages[taxi.estado_taxi]}
          </p>
        </div>
      </div>
    </Card>
  );
}

VehicleCard.propTypes = {
  taxi: PropTypes.shape({
    patente: PropTypes.string,
    marca: PropTypes.string,
    modelo: PropTypes.string,
    color: PropTypes.string,
    ano: PropTypes.string,
    estado_taxi: PropTypes.string
  }),
  loading: PropTypes.bool
};

function TripCard({ booking, onStartTrip, onPickup, onTripComplete, className }) {
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isPickedUp, setIsPickedUp] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const geocodeAddresses = async () => {
      if ((!booking.origen_reserva && !booking.destino_reserva) || 
          (pickupCoords && destinationCoords)) return;

      try {
        setIsGeocoding(true);
        
        // Geocode pickup location
        const pickupResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?` +
          `address=${encodeURIComponent(booking.origen_reserva)}` +
          `&components=country:CL|administrative_area:Tarapacá|locality:Iquique|locality:Alto Hospicio` +
          `&key=${apiKey}`
        );

        // Geocode destination location
        const destinationResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?` +
          `address=${encodeURIComponent(booking.destino_reserva)}` +
          `&components=country:CL|administrative_area:Tarapacá|locality:Iquique|locality:Alto Hospicio` +
          `&key=${apiKey}`
        );

        if (!pickupResponse.ok || !destinationResponse.ok) throw new Error('Geocoding failed');

        const pickupData = await pickupResponse.json();
        const destinationData = await destinationResponse.json();

        if (pickupData.status === 'OK' && pickupData.results[0]) {
          const location = pickupData.results[0].geometry.location;
          setPickupCoords({
            origen_lat: location.lat,
            origen_lng: location.lng
          });
        }

        if (destinationData.status === 'OK' && destinationData.results[0]) {
          const location = destinationData.results[0].geometry.location;
          setDestinationCoords({
            destino_lat: location.lat,
            destino_lng: location.lng
          });
        }
      } catch (error) {
        console.error('Error geocoding addresses:', error);
      } finally {
        setIsGeocoding(false);
      }
    };

    geocodeAddresses();
  }, [booking.origen_reserva, booking.destino_reserva, apiKey, pickupCoords, destinationCoords]);

  const handleStartTrip = () => {
    if (pickupCoords && destinationCoords) {
      onStartTrip(booking.codigo_reserva, {
        ...booking,
        ...pickupCoords,
        ...destinationCoords
      });
    }
  };

  const handlePickup = async () => {
    try {
      const response = await fetch(`/api/bookings/${booking.codigo_reserva}/pickup`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error marking pickup');
      }

      const data = await response.json();
      setIsPickedUp(true);

      // Update the booking state in the parent component
      if (onPickup) {
        onPickup(booking.codigo_reserva, data.booking);
      }
    } catch (error) {
      console.error('Error marking pickup:', error);
    }
  };

  const handleArrival = async () => {
    try {
      const response = await fetch(`/api/bookings/${booking.codigo_reserva}/complete-trip`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error completing trip');
      }

      const data = await response.json();
      setIsArrived(true);

      // Update the booking state in the parent component
      if (onTripComplete) {
        onTripComplete(booking.codigo_reserva, data.booking);
      }
    } catch (error) {
      console.error('Error marking trip as complete:', error);
      // You might want to show an error notification here
    }
  };

  const bookingTime = new Date(booking.fecha_reserva);
  const formattedTime = bookingTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Update status checks
  const isInProgress = booking.estado_reserva === 'CONFIRMADO';
  const isPickupComplete = booking.estado_reserva === 'RECOGIDO';
  const isCompleted = booking.estado_reserva === 'COMPLETADO';

  // Add debug logging
  useEffect(() => {
    console.log('TripCard state:', {
      bookingId: booking.codigo_reserva,
      estado: booking.estado_reserva,
      isInProgress,
      isPickupComplete,
      isCompleted
    });
  }, [booking.estado_reserva, isInProgress, isPickupComplete, isCompleted]);

  return (
    <Card className={`h-full w-full ${className}`}>
      <div className="p-4 flex flex-col justify-between h-full">
        <div className="space-y-2">
          <div className="flex items-start gap-1">
            <MapPin className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">Recoger en:</div>
              <div className="text-sm text-muted-foreground">{booking.origen_reserva}</div>
            </div>
          </div>
          <div className="flex items-start gap-1">
            <MapPin className="h-4 w-4 mt-1 text-red-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">Destino:</div>
              <div className="text-sm text-muted-foreground">{booking.destino_reserva}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formattedTime}
            </div>
            {booking.cliente && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {booking.cliente.nombre} {booking.cliente.apellido}
              </div>
            )}
          </div>
          {isInProgress && !isPickupComplete && !isCompleted && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-600">En progreso</span>
            </div>
          )}
          
          {isPickupComplete && !isCompleted && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
              <span className="text-sm font-medium text-blue-600">Cliente Recogido</span>
            </div>
          )}
        </div>

        {/* Status indicators */}
        <div className="mt-2">
          {isInProgress && !isPickupComplete && !isCompleted && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-warning rounded-full animate-pulse" />
              <span className="text-sm font-medium text-warning">En camino a recoger pasajero</span>
            </div>
          )}
          
          {isPickupComplete && !isCompleted && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">En viaje con cliente a bordo</span>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-success rounded-full" />
              <span className="text-sm font-medium text-success">Viaje Completado</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          {!isInProgress && !isPickupComplete && !isCompleted && (
            <Button 
              color="primary"
              className="w-full font-bold text-white"
              onClick={handleStartTrip}
              disabled={isGeocoding || !pickupCoords || !destinationCoords}
              isLoading={isGeocoding}
            >
              {isGeocoding ? 'Obteniendo ubicaciones...' : 'Iniciar Viaje'}
            </Button>
          )}

          {isInProgress && !isPickupComplete && (
            <Button 
              color="success"
              className="w-full font-bold text-white"
              onClick={handlePickup}
            >
              Confirmar Recogida de Pasajero
            </Button>
          )}

          {isPickupComplete && !isCompleted && (
            <Button 
              color="danger"
              className="w-full font-bold text-white"
              onClick={handleArrival}
            >
              Marcar Llegada a Destino Final
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

TripCard.propTypes = {
  booking: PropTypes.shape({
    codigo_reserva: PropTypes.number.isRequired,
    origen_reserva: PropTypes.string.isRequired,
    destino_reserva: PropTypes.string.isRequired,
    fecha_reserva: PropTypes.string.isRequired,
    estado_reserva: PropTypes.string.isRequired,
    cliente: PropTypes.shape({
      nombre: PropTypes.string,
      apellido: PropTypes.string
    })
  }).isRequired,
  onStartTrip: PropTypes.func.isRequired,
  onPickup: PropTypes.func,
  onTripComplete: PropTypes.func,
  className: PropTypes.string
};

VehicleCard.propTypes = {
  taxi: PropTypes.shape({
    patente: PropTypes.string,
    marca: PropTypes.string,
    modelo: PropTypes.string,
    color: PropTypes.string,
    ano: PropTypes.string,
    estado_taxi: PropTypes.string
  }),
  loading: PropTypes.bool
};

export default TaxiDashboard;
