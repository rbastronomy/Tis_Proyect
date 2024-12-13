import { createLazyFileRoute } from '@tanstack/react-router'
import TripGrid from '../../components/ListaViajes'

export const Route = createLazyFileRoute('/viajes/')({
  component: TripGrid
})
