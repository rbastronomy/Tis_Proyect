import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { MapPin, Calendar, DollarSign } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Chip } from "@nextui-org/react"
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    fetchReservation()
  }, [isAuthenticated, codigoReserva])

  const fetchReservation = async () => {
    try {
      const response = await fetch(`/api/bookings/${codigoReserva}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setReservation(data.reserva)
      }
    } catch (error) {
      console.error('Error fetching reservation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/bookings/${codigoReserva}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          estados: 'APROBAR',
          rut_conductor: null,
          patente_taxi: null,
          observacion: ''
        })
      })
      if (response.ok) {
        await fetchReservation()
      }
    } catch (error) {
      console.error('Error approving reservation:', error)
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
      }
    } catch (error) {
      console.error('Error canceling reservation:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!reservation) {
    return <div>Reservation not found</div>
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_REVISION':
        return 'warning'
      case 'PENDIENTE':
        return 'success'
      case 'EN_CAMINO':
        return 'secondary'
      case 'COMPLETADO':
        return 'success'
      case 'RECHAZADO':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-bold">
              Reserva #{reservation.codigo_reserva}
            </h1>
            <Chip color={getStatusColor(reservation.estado_reserva)} variant="flat">
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
                  <span><strong className="text-gray-700">Desde:</strong> {reservation.origen_reserva}</span>
                </p>
                <p className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span><strong className="text-gray-700">Hasta:</strong> {reservation.destino_reserva}</span>
                </p>
                <p className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span><strong className="text-gray-700">Fecha:</strong> {
                    new Date(reservation.fecha_reserva).toLocaleString()
                  }</span>
                </p>
                {reservation.tarifa && (
                  <p className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      <strong className="text-gray-700">Tarifa:</strong> 
                      ${reservation.tarifa.precio.toLocaleString()} - {reservation.tarifa.descripcion}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Ubicación</h3>
              <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
                <p className="text-gray-500">Mapa no disponible</p>
              </div>
            </div>

            {/* Action buttons */}
            {user?.role?.nombre_rol === 'ADMINISTRADOR' && reservation.estado_reserva === 'EN_REVISION' && (
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  color="success"
                  onClick={handleApprove}
                >
                  Aprobar
                </Button>
                <Button
                  color="danger"
                  onClick={handleCancel}
                >
                  Rechazar
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 