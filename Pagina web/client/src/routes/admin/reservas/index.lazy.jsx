import { createLazyFileRoute } from '@tanstack/react-router'
import AdminReservationGrid from '../../../components/AdminReservationGrid'

export const Route = createLazyFileRoute('/admin/reservas/')({
  component: AdminReservationGrid,
})
