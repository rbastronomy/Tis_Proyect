'use strict';

import Fastify from 'fastify';
import { connectDB } from './db/database.js'; // Corrected import
import dotenv from 'dotenv';
import process from 'process'; // Make process available
import auth from './auth/auth.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import mapsRoutes from './routes/maps.routes.js';
import authRoutes from './routes/authroutes.js';
import fastifyCors from '@fastify/cors'; // CORS plugin

dotenv.config();

const startServer = async () => {
  try {
    // Ensure the database connection is established
    await connectDB();

    const fastify = Fastify({
      logger: true,
    });

    // Register CORS (fixing duplicate CORS registration)
    await fastify.register(fastifyCors, {
      origin: 'http://localhost:5173', // Your frontend URL
      credentials: true,               // Allow credentials (cookies)
    });

    // Register routes
    await fastify.register(userRoutes, { prefix: '/api' });
    await fastify.register(roleRoutes, { prefix: '/api' });
    await fastify.register(permissionRoutes, { prefix: '/api' });
    await fastify.register(mapsRoutes);
    await fastify.register(authRoutes, { prefix: '/api' });

    // Start listening
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Server is running on port 3000');
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
