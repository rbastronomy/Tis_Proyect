import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { MapPin, Calendar, DollarSign, History, Car } from 'lucide-react'
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Chip,
  ScrollShadow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@nextui-org/react"
import { useNavigate } from '@tanstack/react-router'
import { useSocketContext } from '../../context/SocketContext'
import { WS_EVENTS } from '../../constants/WebSocketEvents'
import { Marker, Polyline, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import TaxiMarker from '../../components/TaxiMarker'

const Map = lazy(() => import('../../components/Map'))

export const Route = createLazyFileRoute('/reservas/$codigoReserva')({
  component: ReservationDetail
})

function ReservationDetail() {
  const { codigoReserva } = Route.useParams()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [error, setError] = useState(null)
  const { socket } = useSocketContext()
  const [driverLocation, setDriverLocation] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState(null)

  // Listen for driver location updates
  useEffect(() => {
    if (!socket || !reservation?.taxi?.patente) {
      console.log('Socket or patente not ready:', {
        socketExists: !!socket,
        patente: reservation?.taxi?.patente
      });
      return;
    }

    console.log('Setting up taxi location listener for:', {
      patente: reservation.taxi.patente,
      socketId: socket.id,
      connected: socket.connected
    });

    // Join admin room to receive taxi updates
    socket.emit(WS_EVENTS.JOIN_ADMIN_ROOM);

    // Single handler for location updates
    const handleTaxiLocation = (data) => {
      console.log('Received taxi location update:', data);
      // Only process updates for our taxi
      if (data.patente === reservation.taxi.patente) {
        console.log('Updating driver location:', data);
        setDriverLocation({
          lat: data.lat,
          lng: data.lng,
          accuracy: data.accuracy,
          heading: data.heading
        });
      }
    };

    // Handle taxi going offline
    const handleTaxiOffline = ({ patente }) => {
      if (patente === reservation.taxi.patente) {
        console.log('Our taxi went offline:', patente);
        setDriverLocation(null);
      }
    };

    // Listen for events
    socket.on(WS_EVENTS.TAXI_LOCATION_UPDATE, handleTaxiLocation);
    socket.on(WS_EVENTS.TAXI_OFFLINE, handleTaxiOffline);

    // Debug socket state
    console.log('Socket state:', {
      connected: socket.connected,
      id: socket.id,
      patente: reservation.taxi.patente
    });

    return () => {
      console.log('Cleaning up socket listeners for patente:', reservation.taxi.patente);
      socket.off(WS_EVENTS.TAXI_LOCATION_UPDATE, handleTaxiLocation);
      socket.off(WS_EVENTS.TAXI_OFFLINE, handleTaxiOffline);
      socket.emit(WS_EVENTS.LEAVE_ADMIN_ROOM);
    };
  }, [socket, reservation?.taxi?.patente]);

  // Debug log when driver location updates
  useEffect(() => {
    if (driverLocation) {
      console.log('Driver location updated:', driverLocation);
    }
  }, [driverLocation]);

  // Fetch route when driver location updates with debounce
  useEffect(() => {
    if (!driverLocation || !reservation?.origen_lat || !reservation?.origen_lng) return;

    const fetchRoute = async () => {
      try {
        const origin = `${driverLocation.lat},${driverLocation.lng}`;
        const destination = `${reservation.origen_lat},${reservation.origen_lng}`;

        const response = await fetch(
          `/api/maps/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!response.ok) throw new Error('Error fetching route');

        const data = await response.json();
        if (data.status === 'OK' && data.routes?.length > 0) {
          setRouteCoordinates(data.routes[0].decodedCoordinates);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    // Debounce the route fetch to prevent too many requests
    const timeoutId = setTimeout(fetchRoute, 2000);
    return () => clearTimeout(timeoutId);
  }, [driverLocation, reservation]);

  // Add geocoding when reservation is loaded
  useEffect(() => {
    const geocodeOrigin = async () => {
      // Skip if we already have coordinates
      if (reservation?.origen_lat && reservation?.origen_lng) {
        console.log('Using existing coordinates:', {
          lat: reservation.origen_lat,
          lng: reservation.origen_lng
        });
        return;
      }

      // Skip if we don't have an address to geocode
      if (!reservation?.origen_reserva) {
        console.log('No origin address available');
        return;
      }

      console.log('Geocoding address:', reservation.origen_reserva);

      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?` +
          `address=${encodeURIComponent(reservation.origen_reserva)}` +
          `&components=country:CL|administrative_area:Tarapacá|locality:Iquique|locality:Alto Hospicio` +
          `&key=${apiKey}`
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();
        console.log('Geocoding response:', data);

        if (data.status === 'OK' && data.results[0]) {
          const location = data.results[0].geometry.location;
          console.log('Setting coordinates:', location);
          setReservation(prev => ({
            ...prev,
            origen_lat: location.lat,
            origen_lng: location.lng
          }));
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    };

    geocodeOrigin();
  }, [reservation?.origen_reserva, reservation?.origen_lat, reservation?.origen_lng]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    
    setError(null)
    fetchReservation()
  }, [isAuthenticated, codigoReserva])

  const fetchReservation = async () => {
    try {
      const endpoint = user?.role?.nombre_rol === 'CLIENTE' 
        ? `/api/bookings/${codigoReserva}/client`
        : `/api/bookings/${codigoReserva}`;

      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received reservation data:', data);

        // Preserve existing coordinates if they exist
        if (reservation?.origen_lat && reservation?.origen_lng) {
          setReservation({
            ...data.reserva,
            origen_lat: reservation.origen_lat,
            origen_lng: reservation.origen_lng
          });
        } else {
          setReservation(data.reserva);
        }
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        throw new Error(error.error || 'Error fetching reservation');
      }
    } catch (error) {
      console.error('Error fetching reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/bookings/${codigoReserva}/cancel`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        await fetchReservation()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error canceling reservation:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_REVISION': return 'warning'
      case 'PENDIENTE': return 'primary'
      case 'CONFIRMADO': return 'secondary'
      case 'COMPLETADO': return 'success'
      case 'CANCELADO': return 'danger'
      default: return 'default'
    }
  }

  const getHistoryStatusColor = (status) => {
    switch (status) {
      case 'RESERVA_EN_REVISION': return 'warning'
      case 'RESERVA_CONFIRMADA': return 'success'
      case 'RESERVA_CANCELADA': return 'danger'
      case 'RESERVA_COMPLETADA': return 'success'
      case 'RESERVA_RECHAZADA': return 'danger'
      case 'RESERVA_EN_PROGRESO': return 'secondary'
      default: return 'default'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Debug component for development
  const DebugInfo = () => (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs">
      <div>Socket Connected: {socket?.connected ? 'Yes' : 'No'}</div>
      <div>Socket ID: {socket?.id}</div>
      <div>Taxi: {reservation?.taxi?.patente}</div>
      <div>Driver Location: {driverLocation ? 
        `${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}` : 
        'Not available'
      }</div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
        <Card className="w-full max-w-3xl mx-auto">
          <CardBody>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Cargando reserva...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
        <Card className="w-full max-w-3xl mx-auto">
          <CardBody>
            <div className="text-center text-danger">
              <p>{error}</p>
              <Button 
                color="primary" 
                className="mt-4"
                onClick={() => navigate({ to: '/reservas' })}
              >
                Volver a mis reservas
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
        <Card className="w-full max-w-3xl mx-auto">
          <CardBody>
            <div className="text-center">
              <p>No se encontró la reserva</p>
              <Button 
                color="primary" 
                className="mt-4"
                onClick={() => navigate({ to: '/reservas' })}
              >
                Volver a mis reservas
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      {/* Map Section */}
      {reservation?.estado_reserva === 'CONFIRMADO' && (
        <Card className="w-full max-w-3xl mx-auto mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold">Seguimiento del Conductor</h2>
          </CardHeader>
          <CardBody>
            <div className="h-[400px] relative">
              <Suspense fallback={<div>Cargando mapa...</div>}>
                {reservation && reservation.origen_lat && reservation.origen_lng ? (
                  <Map 
                    position={driverLocation || { 
                      lat: reservation.origen_lat, 
                      lng: reservation.origen_lng 
                    }}
                    isTracking={!!driverLocation}
                  >
                    {driverLocation && (
                      <TaxiMarker 
                        data={{
                          lat: driverLocation.lat,
                          lng: driverLocation.lng,
                          patente: reservation.taxi.patente,
                          estado: 'EN SERVICIO'
                        }}
                      />
                    )}
                    <Marker 
                      position={[reservation.origen_lat, reservation.origen_lng]}
                      icon={L.divIcon({
                        className: 'bg-green-500 rounded-full w-4 h-4 -ml-2 -mt-2',
                        iconSize: [16, 16]
                      })}
                    >
                      <Tooltip permanent>
                        Punto de recogida
                      </Tooltip>
                    </Marker>
                    {routeCoordinates && (
                      <Polyline 
                        positions={routeCoordinates.map(coord => [coord.lat, coord.lng])}
                        color="blue"
                        weight={3}
                        opacity={0.7}
                      />
                    )}
                  </Map>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Obteniendo coordenadas...</p>
                  </div>
                )}
              </Suspense>
            </div>
            {driverLocation && (
              <div className="mt-2 text-sm text-gray-600">
                Ubicación del conductor: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-bold">
              Reserva #{reservation.codigo_reserva}
            </h1>
            <Chip
              color={getStatusColor(reservation.estado_reserva)}
              variant="flat"
            >
              {reservation.estado_reserva}
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <strong className="text-gray-700">Desde:</strong>{' '}
                    {reservation.origen_reserva}
                  </span>
                </p>
                <p className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <strong className="text-gray-700">Hasta:</strong>{' '}
                    {reservation.destino_reserva}
                  </span>
                </p>
                <p className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <strong className="text-gray-700">Fecha:</strong>{' '}
                    {new Date(reservation.fecha_reserva).toLocaleString()}
                  </span>
                </p>
                {reservation.tarifa && (
                  <p className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      <strong className="text-gray-700">Tarifa:</strong> $
                      {reservation.tarifa.precio.toLocaleString()} -{' '}
                      {reservation.tarifa.descripcion}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {reservation.taxi && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Información del Vehículo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="flex items-center text-sm text-gray-600">
                      <Car className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        <strong className="text-gray-700">Vehículo:</strong>{' '}
                        {reservation.taxi.marca} {reservation.taxi.modelo}
                      </span>
                    </p>
                    <p className="flex items-center text-sm text-gray-600">
                      <Car className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        <strong className="text-gray-700">Color:</strong>{' '}
                        {reservation.taxi.color}
                      </span>
                    </p>
                    <p className="flex items-center text-sm text-gray-600">
                      <Car className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        <strong className="text-gray-700">Patente:</strong>{' '}
                        {reservation.taxi.patente}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {['EN_REVISION', 'PENDIENTE'].includes(reservation.estado_reserva) && (
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  color="danger"
                  onPress={onOpen}
                  className="font-bold"
                >
                  Cancelar Reserva
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h2 className="text-xl font-bold">Estado de la Reserva</h2>
          </div>
        </CardHeader>
        <CardBody>
          <ScrollShadow className="max-h-[400px]">
            <div className="space-y-4">
              {reservation?.history?.map((entry, index) => (
                <div key={entry.id_historial || index} className="relative pl-4">
                  {index !== reservation.history.length - 1 && (
                    <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary" />
                    
                    <div className="flex-1 ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip
                          size="sm"
                          color={getHistoryStatusColor(entry.estado_historial)}
                          variant="flat"
                        >
                          {entry.estado_historial}
                        </Chip>
                        <span className="text-sm text-gray-500">
                          {formatDate(entry.fecha_cambio)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Cancelar Reserva
              </ModalHeader>
              <ModalBody>
                <p>¿Está seguro que desea cancelar esta reserva?</p>
                <p className="text-sm text-gray-500">
                  Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="default" 
                  variant="light" 
                  onPress={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  onPress={handleCancel}
                >
                  Confirmar Cancelación
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {process.env.NODE_ENV === 'development' && <DebugInfo />}
    </div>
  )
} 