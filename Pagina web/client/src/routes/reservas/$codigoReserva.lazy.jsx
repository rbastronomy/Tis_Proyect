import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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
      })
      if (response.ok) {
        const data = await response.json()
        setReservation(data.reserva)
      } else {
        const error = await response.json()
        console.error('Error response:', error)
        throw new Error(error.error || 'Error fetching reservation')
      }
    } catch (error) {
      console.error('Error fetching reservation:', error)
    } finally {
      setLoading(false)
    }
  }

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
      case 'EN_CAMINO': return 'secondary'
      case 'COMPLETADO': return 'success'
      case 'RECHAZADO': return 'danger'
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
      case 'RESERVA_EN_PROGRESO': return 'primary'
      default: return 'default'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
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
    )
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
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
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
    </div>
  )
} 