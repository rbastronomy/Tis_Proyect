import { createLazyFileRoute } from '@tanstack/react-router'
import AdminReservationDetail from '../../../components/AdminReservationDetail'
  
export const Route = createLazyFileRoute('/admin/reservas/$codigoReservaAdmin')(
  {
    component: AdminReservationDetail,
  },
)
