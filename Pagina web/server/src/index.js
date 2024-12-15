'use strict';

import Fastify from 'fastify';
import { connectDB } from './db/database.js';
import dotenv from 'dotenv';
import process from 'process';
import fastifyCors from '@fastify/cors';
import { setupRoutes } from './routes/index.js';
import { WebSocketConfig } from './config/WebSocketConfig.js';

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const fastify = Fastify({
      logger: true,
      http2: false
    });

    await fastify.register(fastifyCors, {
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ],
      credentials: true
    });

    setupRoutes(fastify);

    // Initialize WebSocket BEFORE listen
    const wsConfig = new WebSocketConfig(fastify.server);
    const io = wsConfig.initialize();
    fastify.decorate('io', io);

    // Start the server after everything is set up
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Server is running on port 3000');

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
