import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, lazy, Suspense, useCallback, useRef, forwardRef } from 'react'
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
import { Modal } from '@nextui-org/modal'
import { toast, Toaster } from 'react-hot-toast'
import { FormModal } from "../../components/FormModal";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Textarea } from "@nextui-org/input";
import { ConfirmationModal } from "../../components/ConfirmationModal";

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
  const [showTripModal, setShowTripModal] = useState(false)
  const [tripData, setTripData] = useState({
    pasajeros: 1,
    duracion: 0,
    observacion_viaje: ''
  })
  const [isArrived, setIsArrived] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Move fetchRoute definition before the useEffect
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
        // Determine destination based on trip state
        let destination;
        
        if (currentTrip.estado_reserva === 'CONFIRMADO') {
          // If trip is just started, route to pickup location
          destination = `${currentTrip.origen_lat},${currentTrip.origen_lng}`;
        } else if (currentTrip.estado_reserva === 'RECOGIDO') {
          // If passenger is picked up, route to final destination
          destination = `${currentTrip.destino_lat},${currentTrip.destino_lng}`;
        } else {
          return; // Don't fetch route for other states
        }

        console.log('Fetching route:', {
          origin,
          destination,
          tripState: currentTrip.estado_reserva,
          tripDetails: {
            origen: [currentTrip.origen_lat, currentTrip.origen_lng],
            destino: [currentTrip.destino_lat, currentTrip.destino_lng]
          }
        });

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
    }, 1000),
    [] // Empty dependencies since we're using parameters
  );

  // Then the useEffect that uses fetchRoute
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

        // Find any active booking (CONFIRMADO or RECOGIDO)
        const activeBooking = todayBookings.find(
          booking => booking.estado_reserva === 'CONFIRMADO' || booking.estado_reserva === 'RECOGIDO'
        );

        if (activeBooking) {
          console.log('Found active booking:', activeBooking);
          
          // Geocode both origin and destination addresses
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const [originResponse, destinationResponse] = await Promise.all([
            fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?` +
              `address=${encodeURIComponent(activeBooking.origen_reserva)}` +
              `&components=country:CL|administrative_area:Tarapacá|locality:Iquique|locality:Alto Hospicio` +
              `&key=${apiKey}`
            ),
            fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?` +
              `address=${encodeURIComponent(activeBooking.destino_reserva)}` +
              `&components=country:CL|administrative_area:Tarapacá|locality:Iquique|locality:Alto Hospicio` +
              `&key=${apiKey}`
            )
          ]);

          const [originData, destinationData] = await Promise.all([
            originResponse.json(),
            destinationResponse.json()
          ]);

          const tripData = {
            ...activeBooking,
          };

          if (originData.status === 'OK' && originData.results[0]) {
            const location = originData.results[0].geometry.location;
            tripData.origen_lat = location.lat;
            tripData.origen_lng = location.lng;
          }

          if (destinationData.status === 'OK' && destinationData.results[0]) {
            const location = destinationData.results[0].geometry.location;
            tripData.destino_lat = location.lat;
            tripData.destino_lng = location.lng;
          }

          console.log('Setting active trip with data:', tripData);
          setActiveTrip(tripData);

          // If trip is in RECOGIDO state, fetch route to destination
          if (activeBooking.estado_reserva === 'RECOGIDO' && position && tripData.destino_lat) {
            fetchRoute({
              lat: position.lat,
              lng: position.lng
            }, {
              lat: tripData.destino_lat,
              lng: tripData.destino_lng
            });
          } 
          // If trip is in CONFIRMADO state, fetch route to pickup
          else if (activeBooking.estado_reserva === 'CONFIRMADO' && position && tripData.origen_lat) {
            fetchRoute({
              lat: position.lat,
              lng: position.lng
            }, {
              lat: tripData.origen_lat,
              lng: tripData.origen_lng
            });
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
  }, [user?.rut, position, fetchRoute]);

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

  // Update the useEffect that handles route updates
  useEffect(() => {
    if (position && activeTrip) {
      // Force route recalculation when trip state changes to RECOGIDO
      if (activeTrip.estado_reserva === 'RECOGIDO') {
        console.log('Trip state changed to RECOGIDO, recalculating route to destination');
        
        // Only clear route after we confirm we have destination coordinates
        if (activeTrip.destino_lat && activeTrip.destino_lng) {
          setRouteCoordinates(null);
          setRemainingRoute(null);
          
          // Immediately fetch new route
          fetchRoute(position, {
            ...activeTrip,
            estado_reserva: 'RECOGIDO'
          });
        } else {
          console.warn('Missing destination coordinates:', activeTrip);
        }
        return;
      }

      // Regular movement updates
      if (lastPosition) {
        const distanceMoved = calculateDistance(position, lastPosition);
        if (distanceMoved < 10) return; // Don't update if movement is small
      }
      
      // Make sure we have all required coordinates before fetching
      if (activeTrip.estado_reserva === 'CONFIRMADO' && 
          activeTrip.origen_lat && activeTrip.origen_lng) {
        console.log('Fetching route to pickup:', {
          from: position,
          to: { lat: activeTrip.origen_lat, lng: activeTrip.origen_lng }
        });
        fetchRoute(position, activeTrip);
      } else if (activeTrip.estado_reserva === 'RECOGIDO' && 
                 activeTrip.destino_lat && activeTrip.destino_lng) {
        console.log('Fetching route to destination:', {
          from: position,
          to: { lat: activeTrip.destino_lat, lng: activeTrip.destino_lng }
        });
        fetchRoute(position, activeTrip);
      }
    }
  }, [position, activeTrip, fetchRoute, lastPosition]);

  // Also update the route tracking effect
  useEffect(() => {
    if (!position || !routeCoordinates || !activeTrip) return;

    // Initialize remaining route if not set or if trip state changed
    if (!remainingRoute || 
        (activeTrip.estado_reserva === 'RECOGIDO' && remainingRoute.length > 0)) {
      console.log('Initializing/Resetting route tracking');
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

    // Check arrival based on trip state
    if (activeTrip.estado_reserva === 'CONFIRMADO' && 
        calculateDistance(position, {
          lat: activeTrip.origen_lat,
          lng: activeTrip.origen_lng
        }) < 50) {
      console.log('Arrived at pickup location');
    } else if (activeTrip.estado_reserva === 'RECOGIDO' && 
               calculateDistance(position, {
                 lat: activeTrip.destino_lat,
                 lng: activeTrip.destino_lng
               }) < 50) {
      console.log('Arrived at destination');
    }
  }, [position, routeCoordinates, activeTrip, lastPosition, remainingRoute]);

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

  // Add map ref
  const mapRef = useRef(null);

  // Update handleTripComplete
  const handleTripComplete = useCallback((bookingId) => {
    // Update bookings list
    setAssignedBookings(prev => prev.map(booking => 
      booking.codigo_reserva === bookingId 
        ? { ...booking, estado_reserva: 'COMPLETADO' }
        : booking
    ));
    
    // Clear all trip-related state
    setActiveTrip(null);
    setRouteCoordinates(null);
    setRemainingRoute(null);
    setLastPosition(null);
    setShowTripModal(false);
    
    // Reset map view if we have position and map reference
    if (position && mapRef.current) {
      mapRef.current.setView([position.lat, position.lng], 13);
    }
    
    // Show success notification with custom styling
    toast.success('¡Viaje completado exitosamente!', {
      icon: '🎉',
      style: {
        borderRadius: '10px',
        background: '#22c55e',
        color: '#fff',
        padding: '16px',
      },
    });
  }, [position]);

  const handlePickup = useCallback((bookingId, updatedBooking) => {
    console.log('Handling pickup for booking:', bookingId, 'Updated booking:', updatedBooking);
    
    // Update the booking in the list
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
      // Don't clear route data until we confirm we have destination coordinates
      if (activeTrip.destino_lat && activeTrip.destino_lng) {
        setRouteCoordinates(null);
        setRemainingRoute(null);
        
        // Update active trip state with RECOGIDO status
        setActiveTrip(prev => ({
          ...prev,
          estado_reserva: 'RECOGIDO'
        }));

        // Force immediate route recalculation to destination
        if (position) {
          console.log('Calculating new route to destination:', {
            from: position,
            to: {
              lat: activeTrip.destino_lat,
              lng: activeTrip.destino_lng
            }
          });
          
          fetchRoute(position, {
            ...activeTrip,
            estado_reserva: 'RECOGIDO'
          });
        }
      } else {
        console.warn('Missing destination coordinates for pickup:', activeTrip);
      }
    }
  }, [activeTrip, position, fetchRoute]);

  const handleArrival = () => {
    setIsArrived(true);
    setShowTripModal(true);
  };

  const handleTripFormSubmit = async (formData) => {
    try {
        setIsSubmitting(true);

        // Validate form data
        const duracion = parseInt(formData.duracion);
        const pasajeros = parseInt(formData.pasajeros);

        if (!duracion || duracion <= 0) {
            throw new Error('La duración debe ser mayor a 0 minutos');
        }
        if (!pasajeros || pasajeros <= 0) {
            throw new Error('Debe haber al menos 1 pasajero');
        }
        if (!formData.metodo_pago) {
            throw new Error('Debe seleccionar un método de pago');
        }

        // First create the trip record
        const tripResponse = await fetch(`/api/trips/complete/${activeTrip.codigo_reserva}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                duracion,
                pasajeros,
                metodo_pago: formData.metodo_pago,
                observacion_viaje: formData.observacion_viaje || ''
            })
        });

        if (!tripResponse.ok) {
            const error = await tripResponse.json();
            throw new Error(error.message || 'Error al completar el viaje');
        }

        // Then update the booking status - send empty object as body
        const bookingResponse = await fetch(`/api/bookings/${activeTrip.codigo_reserva}/complete-trip`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Send empty object to satisfy body validation
        });

        if (!bookingResponse.ok) {
            const error = await bookingResponse.json();
            throw new Error(error.message || 'Error al actualizar estado de la reserva');
        }

        // Update local state
        handleTripComplete(activeTrip.codigo_reserva);

        // Show success notification
        toast.success('Viaje completado exitosamente');

    } catch (error) {
        console.error('Error completing trip:', error);
        // Show error notification with custom styling
        toast.error(error.message || 'Error al completar el viaje', {
          icon: '❌',
          style: {
            borderRadius: '10px',
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
          },
        });
    } finally {
        setIsSubmitting(false);
        setShowTripModal(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Add Toaster with custom configuration */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Custom success toast styling
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e', // green-500
              secondary: 'white',
            },
            style: {
              background: '#22c55e',
              color: 'white',
              padding: '16px',
            },
          },
          // Custom error toast styling
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444', // red-500
              secondary: 'white',
            },
            style: {
              background: '#ef4444',
              color: 'white',
              padding: '16px',
            },
          },
        }}
      />

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
        <div className="w-full md:flex-1 h-[calc(100vh-20rem)] md:h-[calc(100vh-4rem)] relative z-0">
          <Suspense fallback={<div className="h-full flex items-center justify-center">Cargando mapa...</div>}>
            {console.log('Active Trip:', activeTrip)}
            {console.log('Route Coordinates:', routeCoordinates)}
            <Map 
              ref={mapRef}
              isTracking={isOnline} 
              position={position} 
              error={geoError}
            >
              {/* Only render route if there's an active trip */}
              {activeTrip && remainingRoute && activeTrip.estado_reserva !== 'COMPLETADO' && (
                <Polyline 
                  positions={remainingRoute.map(coord => [coord.lat, coord.lng])}
                  color="blue"
                  weight={3}
                  opacity={0.7}
                />
              )}
              
              {/* Only render markers if trip is not completed */}
              {activeTrip && activeTrip.estado_reserva !== 'COMPLETADO' && (
                <>
                  {activeTrip.estado_reserva === 'CONFIRMADO' && activeTrip.origen_lat && activeTrip.origen_lng && (
                    <Marker 
                      position={[activeTrip.origen_lat, activeTrip.origen_lng]}
                      icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                          <div class="w-2 h-2 bg-white rounded-full"></div>
                        </div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                      })}
                    >
                      <Tooltip permanent offset={[0, -20]}>
                        Punto de recogida
                      </Tooltip>
                    </Marker>
                  )}
                  
                  {activeTrip.estado_reserva === 'RECOGIDO' && activeTrip.destino_lat && activeTrip.destino_lng && (
                    <Marker 
                      position={[activeTrip.destino_lat, activeTrip.destino_lng]}
                      icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                          <div class="w-2 h-2 bg-white rounded-full"></div>
                        </div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                      })}
                    >
                      <Tooltip permanent offset={[0, -20]}>
                        Destino Final
                      </Tooltip>
                    </Marker>
                  )}
                </>
              )}

              {/* Driver marker is always shown if position is available */}
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

              {/* Only fit bounds if there's an active trip that's not completed */}
              {position && activeTrip && activeTrip.estado_reserva !== 'COMPLETADO' && (
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
                        onArrival={() => {
                          setShowTripModal(true);
                          console.log('Opening trip completion modal'); // Debug log
                        }}
                        className="w-full"
                      />
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {showTripModal && (
        <TripCompletionModal
          show={showTripModal}
          onClose={() => setShowTripModal(false)}
          onSubmit={handleTripFormSubmit}
        />
      )}
    </div>
  );
}

function FitBounds({ position, activeTrip }) {
  const map = useMap();

  useEffect(() => {
    if (!position || !activeTrip) return;

    try {
      // Create array of points to include in bounds
      const points = [[position.lat, position.lng]];
      
      // Add appropriate destination point based on trip state
      if (activeTrip.estado_reserva === 'CONFIRMADO' && activeTrip.origen_lat && activeTrip.origen_lng) {
        points.push([activeTrip.origen_lat, activeTrip.origen_lng]);
        console.log('Fitting bounds to include pickup point:', points);
      } else if (activeTrip.estado_reserva === 'RECOGIDO' && activeTrip.destino_lat && activeTrip.destino_lng) {
        points.push([activeTrip.destino_lat, activeTrip.destino_lng]);
        console.log('Fitting bounds to include destination point:', points);
      }

      // Only adjust bounds if we have multiple points
      if (points.length > 1) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15 // Limit max zoom to keep context
        });
      }
    } catch (error) {
      console.error('Error setting map bounds:', error);
      // Fallback to centering on current position
      if (position.lat && position.lng) {
        map.setView([position.lat, position.lng], 13);
      }
    }
  }, [position, activeTrip, map]);

  return null;
}

FitBounds.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  activeTrip: PropTypes.shape({
    origen_lat: PropTypes.number,
    origen_lng: PropTypes.number,
    destino_lat: PropTypes.number,
    destino_lng: PropTypes.number,
    estado_reserva: PropTypes.string
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

function TripCard({ booking, onStartTrip, onPickup, onTripComplete, onArrival, className }) {
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isPickedUp, setIsPickedUp] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Add state for confirmation modals
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showPickupConfirm, setShowPickupConfirm] = useState(false);
  const [showArrivalConfirm, setShowArrivalConfirm] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

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

  // Update handlers to show confirmation first
  const handleStartTripClick = () => {
    if (pickupCoords && destinationCoords) {
      setShowStartConfirm(true);
    }
  };

  const confirmStartTrip = () => {
    setIsConfirming(true);
    onStartTrip(booking.codigo_reserva, {
      ...booking,
      ...pickupCoords,
      ...destinationCoords
    });
    setShowStartConfirm(false);
    setIsConfirming(false);
  };

  const handlePickupClick = () => {
    setShowPickupConfirm(true);
  };

  const confirmPickup = async () => {
    try {
      setIsConfirming(true);
      const response = await fetch(`/api/bookings/${booking.codigo_reserva}/pickup`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error marking pickup');
      }

      const data = await response.json();
      setIsPickedUp(true);

      if (onPickup) {
        onPickup(booking.codigo_reserva, data.booking);
      }
    } catch (error) {
      console.error('Error marking pickup:', error);
      toast.error('Error al confirmar recogida');
    } finally {
      setShowPickupConfirm(false);
      setIsConfirming(false);
    }
  };

  const handleArrivalClick = () => {
    setShowArrivalConfirm(true);
  };

  const confirmArrival = () => {
    onArrival();
    setShowArrivalConfirm(false);
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
    <>
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
                onClick={handleStartTripClick}
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
                onClick={handlePickupClick}
              >
                Confirmar Recogida de Pasajero
              </Button>
            )}

            {isPickupComplete && !isCompleted && (
              <Button 
                color="danger"
                className="w-full font-bold text-white"
                onClick={handleArrivalClick}
              >
                Marcar Llegada a Destino Final
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showStartConfirm}
        onClose={() => setShowStartConfirm(false)}
        onConfirm={confirmStartTrip}
        title="Iniciar Viaje"
        message="¿Está seguro que desea iniciar este viaje? Se dirigirá a la ubicación de recogida del pasajero."
        confirmLabel="Iniciar Viaje"
        confirmColor="primary"
        isLoading={isConfirming}
      />

      <ConfirmationModal
        isOpen={showPickupConfirm}
        onClose={() => setShowPickupConfirm(false)}
        onConfirm={confirmPickup}
        title="Confirmar Recogida"
        message="¿Confirma que ha recogido al pasajero? Esto iniciará la ruta hacia el destino."
        confirmLabel="Confirmar Recogida"
        confirmColor="success"
        isLoading={isConfirming}
      />

      <ConfirmationModal
        isOpen={showArrivalConfirm}
        onClose={() => setShowArrivalConfirm(false)}
        onConfirm={confirmArrival}
        title="Marcar Llegada"
        message="¿Confirma que ha llegado al destino final? Esto completará el viaje."
        confirmLabel="Marcar Llegada"
        confirmColor="danger"
        isLoading={isConfirming}
      />
    </>
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
  onArrival: PropTypes.func.isRequired,
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

function TripCompletionModal({ show, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    pasajeros: 1,
    duracion: 0,
    observacion_viaje: '',
    metodo_pago: 'EFECTIVO'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.duracion || formData.duracion <= 0) {
      newErrors.duracion = 'La duración debe ser mayor a 0 minutos';
    }
    if (!formData.pasajeros || formData.pasajeros <= 0) {
      newErrors.pasajeros = 'Debe haber al menos 1 pasajero';
    }
    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'Debe seleccionar un método de pago';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('Error al completar el viaje');
      }
    }
  };

  return (
    <FormModal
      isOpen={show}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Completar Viaje"
      submitLabel="Completar Viaje"
      size="md"
    >
      <div className="space-y-6">
        <Input
          type="number"
          label="Número de Pasajeros"
          placeholder="Ingrese número de pasajeros"
          min={1}
          value={formData.pasajeros.toString()}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, pasajeros: parseInt(e.target.value) }));
            setErrors(prev => ({ ...prev, pasajeros: null }));
          }}
          isInvalid={!!errors.pasajeros}
          errorMessage={errors.pasajeros}
          variant="bordered"
          classNames={{
            label: "text-sm font-medium",
          }}
        />

        <Input
          type="number"
          label="Duración (minutos)"
          placeholder="Ingrese duración del viaje"
          min={0}
          value={formData.duracion.toString()}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, duracion: parseInt(e.target.value) }));
            setErrors(prev => ({ ...prev, duracion: null }));
          }}
          isInvalid={!!errors.duracion}
          errorMessage={errors.duracion}
          variant="bordered"
          classNames={{
            label: "text-sm font-medium",
          }}
        />

        <Select
          label="Método de Pago"
          placeholder="Seleccione método de pago"
          selectedKeys={[formData.metodo_pago]}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, metodo_pago: e.target.value }));
            setErrors(prev => ({ ...prev, metodo_pago: null }));
          }}
          isInvalid={!!errors.metodo_pago}
          errorMessage={errors.metodo_pago}
          variant="bordered"
          classNames={{
            label: "text-sm font-medium",
          }}
        >
          <SelectItem key="EFECTIVO" value="EFECTIVO">
            Efectivo
          </SelectItem>
          <SelectItem key="TRANSFERENCIA" value="TRANSFERENCIA">
            Transferencia
          </SelectItem>
        </Select>

        <Textarea
          label="Observaciones"
          placeholder="Ingrese observaciones del viaje"
          value={formData.observacion_viaje}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, observacion_viaje: e.target.value }));
            setErrors(prev => ({ ...prev, observacion_viaje: null }));
          }}
          isInvalid={!!errors.observacion_viaje}
          errorMessage={errors.observacion_viaje}
          variant="bordered"
          classNames={{
            label: "text-sm font-medium",
          }}
          minRows={3}
        />
      </div>
    </FormModal>
  );
}

TripCompletionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default TaxiDashboard;

