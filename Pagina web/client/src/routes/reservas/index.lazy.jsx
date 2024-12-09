import { createLazyFileRoute } from '@tanstack/react-router'
import ReservationGrid from '../../components/ListaReservas'

export const Route = createLazyFileRoute('/reservas/')({
  component: ReservationGrid
})
