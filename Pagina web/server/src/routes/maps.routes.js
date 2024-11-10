import { MapsController } from '../controllers/maps.controller.js'

export default async function mapsRoutes(fastify) {
  const mapsController = new MapsController()

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
    handler: async (request) => {
      const { origin, destination } = request.query
      return await mapsController.getDirections(origin, destination)
    }
  })
} 