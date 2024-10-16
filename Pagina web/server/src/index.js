'use strict';

import Fastify from 'fastify';
import { connectDB, db } from './db/database.js'; // Corrected import
import { authPlugin } from './auth/index.js'; // Corrected import path
import dotenv from 'dotenv';
import process from 'process'; // Add this line to make process available
import auth from './auth/auth.js';

dotenv.config();

const startServer = async () => {
  try {
    // Use connectDB to ensure the connection is established
    await connectDB();

    const fastify = Fastify({
      logger: true
    });

    // Register the auth plugin
    fastify.register(authPlugin);

    await fastify.listen({ port: 3000 });
    console.log('Server is running on port 3000');

    const userId = 1; // This could come from a request or other source
    const user = await db('users').where({ id: userId }).first();
    console.log('User fetched:', user); // Log the result of the query

    if (!user) {
      throw new Error('User not found');
    }


    try{
      const testSession = await auth.createSession(user.id)
      //await auth.invalidateAllSessions(user.id) // Invalida todas las sesiones del usuario de la base de datos
      console.log(testSession);
    } catch (err) {
      console.error('Error creating session:', err);
    }
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();