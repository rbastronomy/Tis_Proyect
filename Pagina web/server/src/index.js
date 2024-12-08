'use strict';

import Fastify from 'fastify';
import dotenv from 'dotenv';
import process from 'process';
import fastifyCors from '@fastify/cors';
import { setupRoutes } from './routes/index.js';

dotenv.config();

const startServer = async () => {
  try {
    const fastify = Fastify();

    // CORS básico
    await fastify.register(fastifyCors, {
      origin: ['http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    });

    // Setup routes
    setupRoutes(fastify);

    // Iniciar el servidor
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on port 3000');
    
    // Log de rutas disponibles
    console.log('Available routes:', fastify.printRoutes());

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

startServer();
