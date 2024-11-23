import { mapsController } from '../controllers/MapController.js'

export default async function mapsRoutes(fastify) {
  fastify.get('/api/directions', {
    schema: {
      querystring: {
        type: 'object',
        required: ['origin', 'destination'],
        properties: {
          origin: { type: 'string' },
          destination: { type: 'string' }
        }
      }
    },
    handler: mapsController.getDirections.bind(mapsController)
  })
} 