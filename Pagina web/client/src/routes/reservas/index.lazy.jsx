import { createLazyFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Chip,
  ButtonGroup,
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
          : '/api/reservas' // For users/admin, show all bookings

      const response = await fetch(endpoint, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.reservas)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
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

  const renderActions = (booking) => {
    const role = user?.role?.nombrerol

    if (role === 'CONDUCTOR' && booking.estados === 'PENDIENTE') {
      return (
        <Button
          color="primary"
          size="sm"
          onClick={() => handleStartTrip(booking.codigoreserva)}
        >
          Iniciar Viaje
        </Button>
      )
    }

    if (role === 'CONDUCTOR' && booking.estados === 'EN_CAMINO') {
      return (
        <Button
          color="success"
          size="sm"
          onClick={() => handleCompleteTrip(booking.codigoreserva)}
        >
          Completar Viaje
        </Button>
      )
    }

    if (
      ['USUARIO', 'ADMINISTRADOR'].includes(role) &&
      booking.estados === 'EN_REVISION'
    ) {
      return (
        <Button
          color="danger"
          size="sm"
          onClick={() => handleCancelBooking(booking.codigoreserva)}
        >
          Cancelar
        </Button>
      )
    }

    return null
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

      <Table aria-label="Tabla de reservas">
        <TableHeader>
          <TableColumn>CÓDIGO</TableColumn>
          <TableColumn>ORIGEN</TableColumn>
          <TableColumn>DESTINO</TableColumn>
          <TableColumn>FECHA</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>TIPO</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.codigoreserva}>
              <TableCell>{booking.codigoreserva}</TableCell>
              <TableCell>{booking.origenv}</TableCell>
              <TableCell>{booking.destinov}</TableCell>
              <TableCell>
                {new Date(booking.freserva).toLocaleString()}
              </TableCell>
              <TableCell>
                <Chip color={getStatusColor(booking.estados)} variant="flat">
                  {booking.estados}
                </Chip>
              </TableCell>
              <TableCell>{booking.tipo}</TableCell>
              <TableCell>{renderActions(booking)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
