import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSocketContext } from '../../context/SocketContext'
import { Card } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Switch } from "@nextui-org/switch"
import { MapPin, Clock, User, Bell, Car } from 'lucide-react'
import { useDriverLocation } from '../../hooks/useDriverLocation'
import PropTypes from 'prop-types'

const Map = lazy(() => import('../../components/Map'))

export const Route = createFileRoute('/taxi/')({
  component: TaxiDashboard
})

function TaxiDashboard() {
  // 1. Context hooks first
  const { user } = useAuth()

  // 2. All useState hooks
  const [isOnline, setIsOnline] = useState(false)
  const [assignedBookings, setAssignedBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignedTaxi, setAssignedTaxi] = useState(null)
  const [taxiLoading, setTaxiLoading] = useState(true)

  // 3. Custom hooks
  const { position, error: geoError, isConnected, isConnecting, isAuthenticated } = useDriverLocation({
    isOnline,
    driverId: user?.rut,
    patente: assignedTaxi?.patente,
    onError: (error) => {
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

        // Add mock booking for testing scroll snap
        const mockBooking = {
          codigo_reserva: 999,
          rut_cliente: 20247469,
          id_oferta: 1,
          origen_reserva: "Mall Plaza Iquique",
          destino_reserva: "Terminal Agropecuario",
          fecha_reserva: new Date().toISOString(), // Today's date
          tipo_reserva: "CIUDAD",
          observacion_reserva: "",
          estado_reserva: "PENDIENTE",
          servicio: {
            tipo: "NORMAL",
            descripcion: "Servicio normal de transporte"
          },
          tarifa: {
            precio: 5000,
            descripcion: "Tarifa urbana",
            tipo: "CIUDAD"
          },
          cliente: {
            nombre: "Juan",
            apellido: "Pérez"
          }
        };

        setAssignedBookings([...todayBookings, mockBooking]);
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
    }
  };

  const handleStartTrip = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/start`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ driverId: user.rut })
      });

      if (!response.ok) {
        throw new Error('Error starting trip');
      }

      setAssignedBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
            <Map 
              isTracking={isOnline} 
              position={position} 
              error={geoError}
            />
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
          <Card className="m-4 flex-1 overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
            <div className="p-4 flex-shrink-0 border-b">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Viajes Asignados Hoy</h2>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-4">Cargando viajes...</div>
            ) : assignedBookings.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No hay viajes asignados para hoy
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 snap-y snap-mandatory scroll-smooth">
                {assignedBookings
                  .sort((a, b) => new Date(a.fecha_reserva) - new Date(b.fecha_reserva))
                  .map((booking) => (
                    <div 
                      key={booking.codigo_reserva} 
                      className="snap-center h-[calc(100%-1rem)] p-2"
                    >
                      <TripCard
                        booking={booking}
                        onStartTrip={handleStartTrip}
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

function TripCard({ booking, onStartTrip, className }) {
  const bookingTime = new Date(booking.fecha_reserva);
  const formattedTime = bookingTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <Card className={`h-full w-full ${className}`}>
      <div className="p-4 flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">Recoger en:</div>
              <div className="text-sm text-muted-foreground">{booking.origen_reserva}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-1 text-red-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">Destino:</div>
              <div className="text-sm text-muted-foreground">{booking.destino_reserva}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
        </div>
        <Button 
          color="primary" 
          className="w-full mt-4"
          onClick={() => onStartTrip(booking.codigo_reserva)}
        >
          Iniciar Viaje
        </Button>
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
    cliente: PropTypes.shape({
      nombre: PropTypes.string,
      apellido: PropTypes.string
    })
  }).isRequired,
  onStartTrip: PropTypes.func.isRequired,
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
