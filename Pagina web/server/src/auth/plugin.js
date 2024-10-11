import fp from 'fastify-plugin';
import { lucia } from './lucia.js';

async function authPlugin(fastify, options) {
  fastify.decorate('auth', lucia);
  
  fastify.addHook('onRequest', async (request, reply) => {
    request.auth = lucia.handleRequest(request, reply);
  });
}

export default fp(authPlugin);