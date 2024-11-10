'use strict';

import Fastify from 'fastify';
import { connectDB, db } from './db/database.js'; // Corrected import
import { authPlugin } from './auth/index.js'; // Corrected import path
import dotenv from 'dotenv';
import process from 'process'; // Make process available
import auth from './auth/auth.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import cors from '@fastify/cors';
import mapsRoutes from './routes/maps.routes.js';

dotenv.config()

const startServer = async () => {
  try {
    // Ensure the database connection is established
    await connectDB();

    const fastify = Fastify({
      logger: true
    });

    // Register CORS
    await fastify.register(cors, {
      origin: true // or specify your frontend URL
    });

    // Register auth plugin if needed
    // await fastify.register(authPlugin);

    // Register routes
    await fastify.register(userRoutes, { prefix: '/api' });
    await fastify.register(roleRoutes, { prefix: '/api' });
    await fastify.register(permissionRoutes, { prefix: '/api' });
    await fastify.register(mapsRoutes);

    // Start listening
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Server is running on port 3000');

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();