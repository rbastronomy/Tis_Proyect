import { createLazyFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Divider
} from '@nextui-org/react'

export const Route = createLazyFileRoute('/reservas/')({
  component: BookingList,
})

function BookingList() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    fetchBookings()
  }, [isAuthenticated, navigate])

  const fetchBookings = async () => {
    try {
      // Different endpoints based on user role
      const endpoint =
        user?.role?.nombrerol === 'CONDUCTOR'
          ? '/api/reservas/pending' // For drivers, show pending trips
          : '/api/reservas/' // For users/admin, show all bookings

      const response = await fetch(endpoint, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        console.log(data)
        setBookings(data.reservas || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleStartTrip = async (codigoreserva) => {
    try {
      const response = await fetch(`/api/reservas/${codigoreserva}/start`, {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        await fetchBookings()
      }
    } catch (error) {
      console.error('Error starting trip:', error)
    }
  }

  const handleCompleteTrip = async (codigoreserva) => {
    try {
      const response = await fetch(`/api/reservas/${codigoreserva}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duracion: 30, // This should be calculated or input by driver
          observacion: 'Viaje completado',
        }),
      })

      if (response.ok) {
        await fetchBookings()
      }
    } catch (error) {
      console.error('Error completing trip:', error)
    }
  }

  const handleCancelBooking = async (codigoreserva) => {
    try {
      const response = await fetch(`/api/reservas/${codigoreserva}/cancel`, {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        await fetchBookings()
      }
    } catch (error) {
      console.error('Error canceling booking:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      EN_REVISION: 'warning',
      PENDIENTE: 'primary',
      EN_CAMINO: 'secondary',
      COMPLETADO: 'success',
      RECHAZADO: 'danger',
    }
    return colors[status] || 'default'
  }

  const handleCardClick = (codigoreserva) => {
    navigate({ to: `/reservas/${codigoreserva}` })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Reservas</h1>
        {['USUARIO', 'ADMINISTRADOR'].includes(user?.role?.nombrerol) && (
          <Button
            color="primary"
            onClick={() => navigate({ to: '/reservas/create' })}
          >
            Nueva Reserva
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <Card 
            key={booking.codigoreserva}
            isPressable
            onPress={() => handleCardClick(booking.codigoreserva)}
            className="w-full"
          >
            <CardHeader className="flex justify-between">
              <div>
                <p className="text-small text-default-500">
                  Reserva #{booking.codigoreserva}
                </p>
                <p className="text-md font-semibold">
                  {booking.servicio?.tipo || 'Servicio no especificado'}
                </p>
              </div>
              <Chip color={getStatusColor(booking.estados)} variant="flat">
                {booking.estados}
              </Chip>
            </CardHeader>
            <Divider/>
            <CardBody>
              <div className="space-y-2">
                <div>
                  <p className="text-small font-medium">Desde</p>
                  <p className="text-small text-default-500">{booking.origenv}</p>
                </div>
                <div>
                  <p className="text-small font-medium">Hasta</p>
                  <p className="text-small text-default-500">{booking.destinov}</p>
                </div>
                <div>
                  <p className="text-small font-medium">Fecha</p>
                  <p className="text-small text-default-500">
                    {booking.freserva ? new Date(booking.freserva).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
            </CardBody>
            {user?.role?.nombrerol === 'ADMINISTRADOR' && booking.estados === 'EN_REVISION' && (
              <CardFooter className="gap-2">
                <Button 
                  color="success" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Add approval logic here
                  }}
                >
                  Aprobar
                </Button>
                <Button 
                  color="danger" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelBooking(booking.codigoreserva)
                  }}
                >
                  Rechazar
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      {(!bookings || bookings.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          No hay reservas para mostrar
        </div>
      )}
    </div>
  )
}
