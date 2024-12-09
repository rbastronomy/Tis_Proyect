'use strict';

import Fastify from 'fastify';
import { connectDB } from './db/database.js';
import dotenv from 'dotenv';
import process from 'process';
import fastifyCors from '@fastify/cors';
import { setupRoutes } from './routes/index.js';

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const fastify = Fastify({
      logger: true,
    });

    // Register CORS first
    await fastify.register(fastifyCors, {
      origin: 'http://localhost:5173',
      credentials: true,
    });


    // Setup routes
    setupRoutes(fastify);

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Server is running on port 3000');
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
