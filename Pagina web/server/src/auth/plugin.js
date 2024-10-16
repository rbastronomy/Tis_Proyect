import fp from 'fastify-plugin';
import auth from './auth.js';

async function authPlugin(fastify) {
  fastify.decorate('auth', auth);
  
  fastify.addHook('onRequest', async (request, reply) => {
    request.auth = auth.handleRequest(request, reply);
  });
}

export default fp(authPlugin);