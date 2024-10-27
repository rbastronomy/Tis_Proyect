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

dotenv.config();

const startServer = async () => {
  try {
    // Ensure the database connection is established
    await connectDB();

    const fastify = Fastify({
      logger: true
    });

    // Register auth plugin if needed
    // await fastify.register(authPlugin);

    // Register routes
    await fastify.register(userRoutes, { prefix: '/api' });
    await fastify.register(roleRoutes, { prefix: '/api' });
    await fastify.register(permissionRoutes, { prefix: '/api' });

    // Start listening
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Server is running on port 3000');

    // Example usage after server starts
    const userId = 1; // This could come from a request or other source
    const user = await db('users').where({ id: userId }).first();
    fastify.log.info('User fetched:', user); // Log the result of the query

    if (!user) {
      throw new Error('User not found');
    }

    try {
      const testSession = await auth.createSession(user.id);
      // await auth.invalidateAllSessions(user.id); // Invalidate all user sessions
      fastify.log.info(testSession);
    } catch (err) {
      fastify.log.error('Error creating session:', err);
    }
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();