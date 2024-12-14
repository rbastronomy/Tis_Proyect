import { createLazyFileRoute } from '@tanstack/react-router'
import RatingGrid from '../../components/ListaValoraciones'

export const Rating = createLazyFileRoute('/valoracion/')({
  component: RatingGrid,
})
