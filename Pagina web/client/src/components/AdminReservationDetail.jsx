import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { MapPin, Calendar, DollarSign, History, User, Phone, Mail, Car, CreditCard, Package } from 'lucide-react'
import { formatPrice, formatDateTime } from '../utils/format'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  ScrollShadow,
} from '@nextui-org/react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useSocketContext } from '../context/SocketContext'
import { WS_EVENTS } from '../constants/WebSocketEvents'
import { TripTrackingMap } from './TripTrackingMap'
import AdminEditBookingModal from './AdminEditBookingModal'

export default function AdminReservationDetail() {
  const { codigoReservaAdmin } = useParams({ 
    from: '/admin/reservas/$codigoReservaAdmin'
  })
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [availableTaxisWithDrivers, setAvailableTaxisWithDrivers] = useState([])
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [isApprovalFlow, setIsApprovalFlow] = useState(false)
  const [driverInfo, setDriverInfo] = useState(null)
  const [driverLocation, setDriverLocation] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState(null)
  const { socket } = useSocketContext()
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role?.nombre_rol !== 'ADMINISTRADOR') {
      navigate({ to: '/login' })
      return
    }
    fetchReservation()
  }, [isAuthenticated, codigoReservaAdmin, user])

  useEffect(() => {
    if (!socket || !reservation?.taxi?.patente || 
        !['CONFIRMADO', 'RECOGIDO'].includes(reservation.estado_reserva)) {
      return;
    }

    console.log('Setting up taxi location listener:', reservation.taxi.patente);

    const handleTaxiLocation = (data) => {
      if (data.patente === reservation.taxi.patente) {
        console.log('Received location update for taxi:', data);
        setDriverLocation({
          lat: data.lat,
          lng: data.lng,
          accuracy: data.accuracy,
          heading: data.heading
        });
      }
    };

    const handleTaxiOffline = ({ patente }) => {
      if (patente === reservation.taxi.patente) {
        console.log('Taxi went offline:', patente);
        setDriverLocation(null);
      }
    };

    socket.emit(WS_EVENTS.JOIN_ADMIN_ROOM);
    socket.on(WS_EVENTS.TAXI_LOCATION_UPDATE, handleTaxiLocation);
    socket.on(WS_EVENTS.TAXI_OFFLINE, handleTaxiOffline);

    return () => {
      socket.off(WS_EVENTS.TAXI_LOCATION_UPDATE, handleTaxiLocation);
      socket.off(WS_EVENTS.TAXI_OFFLINE, handleTaxiOffline);
      socket.emit(WS_EVENTS.LEAVE_ADMIN_ROOM);
    };
  }, [socket, reservation?.taxi?.patente, reservation?.estado_reserva]);

  useEffect(() => {
    if (!driverLocation || 
       (!reservation?.origen_lat && !reservation?.destino_lat) || 
       (!reservation?.origen_lng && !reservation?.destino_lng)) return;

    const fetchRoute = async () => {
      try {
        const origin = `${driverLocation.lat},${driverLocation.lng}`;
        let destination;

        if (reservation.estado_reserva === 'CONFIRMADO') {
          destination = `${reservation.origen_lat},${reservation.origen_lng}`;
        } else if (reservation.estado_reserva === 'RECOGIDO') {
          destination = `${reservation.destino_lat},${reservation.destino_lng}`;
        } else {
          return;
        }

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

    const timeoutId = setTimeout(fetchRoute, 2000);
    return () => clearTimeout(timeoutId);
  }, [driverLocation, reservation]);

  useEffect(() => {
    const geocodeAddresses = async () => {
      if (
        (!reservation?.origen_lat && reservation?.origen_reserva) ||
        (!reservation?.destino_lat && reservation?.destino_reserva)
      ) {
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const geocodePromises = [];

          if (!reservation.origen_lat && reservation.origen_reserva) {
            geocodePromises.push(
              fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?` +
                `address=${encodeURIComponent(reservation.origen_reserva)}` +
                `&components=country:CL|administrative_area:Tarapacá|locality:Iquique|locality:Alto Hospicio` +
                `&key=${apiKey}`
              ).then(res => res.json())
            );
          }

          if (!reservation.destino_lat && reservation.destino_reserva) {
            geocodePromises.push(
              fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?` +
                `address=${encodeURIComponent(reservation.destino_reserva)}` +
                `&components=country:CL|administrative_area:Tarapacá|locality:Iquique|locality:Alto Hospicio` +
                `&key=${apiKey}`
              ).then(res => res.json())
            );
          }

          const results = await Promise.all(geocodePromises);
          const updates = {};

          results.forEach((data, index) => {
            if (data.status === 'OK' && data.results[0]) {
              const location = data.results[0].geometry.location;
              if (index === 0 && !reservation.origen_lat) {
                updates.origen_lat = location.lat;
                updates.origen_lng = location.lng;
              } else if (index === 1 && !reservation.destino_lat) {
                updates.destino_lat = location.lat;
                updates.destino_lng = location.lng;
              }
            }
          });

          if (Object.keys(updates).length > 0) {
            setReservation(prev => ({
              ...prev,
              ...updates
            }));
          }
        } catch (error) {
          console.error('Error geocoding addresses:', error);
        }
      }
    };

    geocodeAddresses();
  }, [reservation?.origen_reserva, reservation?.destino_reserva]);

  const fetchReservation = async () => {
    try {
      const response = await fetch(`/api/bookings/${codigoReservaAdmin}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        if (data.reserva) {
          setReservation(data.reserva)
          if (data.reserva.taxi?.conductor) {
            setDriverInfo({
              nombre: data.reserva.taxi.conductor.nombre,
              apellido: data.reserva.taxi.conductor.apellido,
              correo: data.reserva.taxi.conductor.correo,
              telefono: data.reserva.taxi.conductor.telefono,
              rut: data.reserva.taxi.conductor.rut
            })
          } else if (data.reserva.rut_conductor) {
            fetchDriverInfo(data.reserva.rut_conductor)
          }
        } else {
          console.error('No reservation data in response')
        }
      } else {
        console.error('Failed to fetch reservation:', response.status)
      }
    } catch (error) {
      console.error('Error fetching reservation:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDriverInfo = async (rutConductor) => {
    try {
      const response = await fetch(`/api/taxis/driver-info/${rutConductor}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setDriverInfo({
          nombre: data.driver.nombre,
          apellido: data.driver.apellido,
          correo: data.driver.correo,
          telefono: data.driver.telefono,
          rut: data.driver.rut
        })
      }
    } catch (error) {
      console.error('Error fetching driver info:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_REVISION': return 'warning'
      case 'APROBADO': return 'success'
      case 'RECHAZADO': return 'danger'
      default: return 'default'
    }
  }

  const fetchAvailableTaxisWithDrivers = async () => {
    try {
      const reservationTime = reservation.fecha_reserva;
      console.log('Fetching taxis for reservation time:', reservationTime);

      const response = await fetch(`/api/taxis/available?fecha_reserva=${encodeURIComponent(reservationTime)}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTaxisWithDrivers(data.taxis);
      }
    } catch (error) {
      console.error('Error fetching taxis:', error);
    }
  };

  const handleOpenAssignModal = (isApproval = false) => {
    setIsApprovalFlow(isApproval);
    fetchAvailableTaxisWithDrivers();
    onOpen();
  };

  const handleConfirmAssignment = async () => {
    try {
      const selectedTaxi = availableTaxisWithDrivers.find(
        taxi => taxi.patente === reservation.patente_taxi
      );

      if (!selectedTaxi) {
        console.error('No taxi selected');
        return;
      }

      console.log('Sending assignment request:', {
        codigoReserva: codigoReservaAdmin,
        estados: isApprovalFlow ? 'APROBAR' : 'PENDIENTE',
        rut_conductor: selectedTaxi.conductor.rut,
        patente_taxi: selectedTaxi.patente
      });

      const response = await fetch(`/api/bookings/${codigoReservaAdmin}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          estados: isApprovalFlow ? 'APROBAR' : 'PENDIENTE',
          rut_conductor: selectedTaxi.conductor.rut,
          patente_taxi: selectedTaxi.patente,
          observacion: isApprovalFlow ? 'Reserva aprobada y conductor asignado' : 'Conductor asignado'
        }),
      });

      if (response.ok) {
        await fetchReservation();
        onOpenChange(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to assign driver:', errorData.message || response.status);
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getHistoryStatusColor = (status) => {
    switch (status) {
      case 'RESERVA_EN_REVISION': return 'warning'
      case 'RESERVA_CONFIRMADA': return 'success'
      case 'RESERVA_CANCELADA': return 'danger'
      case 'RESERVA_COMPLETADA': return 'success'
      case 'RESERVA_RECHAZADA': return 'danger'
      case 'RESERVA_EN_PROGRESO': return 'primary'
      default: return 'default'
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!reservation) {
    return <div>Reservation not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-bold">
              Reserva #{reservation.codigo_reserva}
            </h1>
            <div className="flex items-center gap-4">
              {reservation.estado_reserva === 'EN_REVISION' && (
                <Button 
                  color="success" 
                  onClick={() => handleOpenAssignModal(true)}
                  className="text-white font-bold"
                >
                  Aprobar y Asignar Taxi
                </Button>
              )}
              <Chip
                color={getStatusColor(reservation.estado_reserva)}
                variant="flat"
              >
                {reservation.estado_reserva}
              </Chip>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {reservation.servicio && (
                  <p className="flex items-center text-sm text-gray-600">
                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      <strong className="text-gray-700">Servicio:</strong>{' '}
                      {reservation.servicio.descripcion_servicio} ({reservation.servicio.tipo_servicio})
                    </span>
                  </p>
                )}
                
                {reservation.servicio?.tarifas?.[0] && (
                  <p className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      <strong className="text-gray-700">Tarifa:</strong>{' '}
                      {formatPrice(reservation.servicio.tarifas[0].precio)} - {reservation.servicio.tarifas[0].descripcion_tarifa}
                    </span>
                  </p>
                )}

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
                    {formatDateTime(reservation.fecha_reserva)}
                  </span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            {user?.role?.nombre_rol === 'ADMINISTRADOR' && (
              <div className="flex justify-end space-x-2 mt-4">
                {reservation.estado_reserva === 'PENDIENTE' && (
                  <Button 
                    color="primary" 
                    onClick={() => handleOpenAssignModal(false)}
                    className="text-white font-bold"
                  >
                    {reservation.taxi?.conductor ? 'Cambiar Conductor' : 'Asignar Taxi'}
                  </Button>
                )}
                <Button
                  color="secondary"
                  onClick={() => setShowEditModal(true)}
                  className="text-white font-bold"
                >
                  Editar Reserva
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {driverInfo && (
        <Card className="w-full max-w-3xl mx-auto mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <h2 className="text-xl font-bold">Información del Conductor</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <strong className="text-gray-700">Nombre:</strong>{' '}
                    {driverInfo.nombre} {driverInfo.apellido}
                  </span>
                </p>
                <p className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <strong className="text-gray-700">Email:</strong>{' '}
                    {driverInfo.correo}
                  </span>
                </p>
                <p className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <strong className="text-gray-700">Teléfono:</strong>{' '}
                    {driverInfo.telefono}
                  </span>
                </p>
              </div>
              <div className="space-y-3">
                {reservation?.taxi && (
                  <>
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
                        <strong className="text-gray-700">Patente:</strong>{' '}
                        {reservation.taxi.patente}
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
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        <strong className="text-gray-700">Año:</strong>{' '}
                        {reservation.taxi.ano}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {reservation?.cliente && (
        <Card className="w-full max-w-3xl mx-auto mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <h2 className="text-xl font-bold">Información del Cliente</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <strong className="text-gray-700">Nombre:</strong>{' '}
                    {reservation.cliente.nombre} {reservation.cliente.apellido}
                  </span>
                </p>
                <p className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <strong className="text-gray-700">Email:</strong>{' '}
                    {reservation.cliente.correo}
                  </span>
                </p>
                <p className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <strong className="text-gray-700">Teléfono:</strong>{' '}
                    {reservation.cliente.telefono}
                  </span>
                </p>
                <p className="flex items-center text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <strong className="text-gray-700">RUT:</strong>{' '}
                    {reservation.cliente.rut}
                  </span>
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h2 className="text-xl font-bold">Historial de la Reserva</h2>
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
                      
                      <p className="text-sm">
                        <span className="font-semibold">Acción:</span> {entry.accion}
                      </p>
                      
                      {entry.observacion_historial && (
                        <p className="text-sm text-gray-600 mt-1">
                          {entry.observacion_historial}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>

      <TripTrackingMap 
        reservation={reservation}
        driverLocation={driverLocation}
        routeCoordinates={routeCoordinates}
      />

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {reservation.taxi?.conductor ? 'Cambiar Conductor' : 'Asignar Taxi'}
              </ModalHeader>
              <ModalBody className="gap-4">
                <Select
                  label="Taxi y Conductor"
                  value={reservation?.patente_taxi || ''}
                  onChange={(e) =>
                    setReservation({
                      ...reservation,
                      patente_taxi: e.target.value,
                    })
                  }
                >
                  {availableTaxisWithDrivers.map((taxi) => (
                    <SelectItem key={taxi.patente} value={taxi.patente}>
                      {`${taxi.marca} ${taxi.modelo} (${taxi.patente}) - Conductor: ${taxi.conductor.nombre}`}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                  className="font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleConfirmAssignment();
                    onClose();
                  }}
                  isDisabled={!reservation?.patente_taxi}
                  className="text-white font-bold"
                >
                  {reservation.taxi?.conductor ? 'Confirmar Cambio' : 'Confirmar Asignación'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <AdminEditBookingModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={() => {
          setShowEditModal(false);
          fetchReservation(); // Refresh the reservation data
        }}
        reservation={reservation}
      />
    </div>
  )
}
