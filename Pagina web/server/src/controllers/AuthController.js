import auth from '../auth/auth.js';
import { UserService } from '../services/UserService.js';
import { LuciaError } from 'lucia-auth';
import dotenv from 'dotenv';

dotenv.config();

const userService = new UserService();

export class AuthController {
  /**
   * Handles user login using Lucia Auth.
   * @param {Object} request - Fastify request object.
   * @param {Object} reply - Fastify reply object.
   */
  async login(request, reply) {
    const { email, password } = request.body;

    try {

        const user = await userService.validateUserCredentials(email, password);
        
        if (!user) {
            return reply.status(401).send({ error: 'Invalid email or password' });
        }

        const roles = await userService.getRoles(user.id);
        const permissions = await userService.getPermissions(user.id);

        const session = await auth.createSession(user.id);
        const sessionCookie = auth.provider.createSessionCookie(session.id);

        reply.header('Set-Cookie', 'session_id=' + sessionCookie.id + '; HttpOnly; Secure; SameSite=Strict');
        return reply.send({ message: 'Login successful', userId: user.id, roles, permissions });
        
    } catch (error) {
        console.error('Login error:', error);
        request.log.error(error);
        return reply.status(500).send({ error: 'An error occurred during login' });
    }
  }

  /**
   * Handles user registration using Lucia Auth.
   * @param {Object} request - Fastify request object.
   * @param {Object} reply - Fastify reply object.
   */
  async register(request, reply) {
    const { username, password, email } = request.body;

    try {
      // Check if user already exists
      const existingUser = await userService.getByUsername(username);
      if (existingUser) {
        return reply.status(400).send({ error: 'Username already taken' });
      }

      // Create new user using Lucia Auth
      const newUser = await auth.createUser({ username, password, email });
      
      // Optionally assign a default role, e.g., 'user'
      const defaultRole = await userService.getRoleByName('user');
      if (defaultRole) {
        await userService.assignRole(newUser.id, defaultRole.id);
      }

      return reply.send({ message: 'Registration successful', userId: newUser.id });
    } catch (error) {
      if (error instanceof LuciaError) {
        return reply.status(400).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'An error occurred during registration' });
    }
  }

  /**
   * Handles user logout.
   * @param {Object} request - Fastify request object.
   * @param {Object} reply - Fastify reply object.
   */
  async logout(request, reply) {
    const sessionId = request.cookies[auth.provider.sessionCookieName];

    try {
      await auth.invalidateSession(sessionId);
      reply.clearCookie(auth.provider.sessionCookieName);
      return reply.send({ message: 'Logout successful' });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'An error occurred during logout' });
    }
  }

  /**
   * Validates the current user session.
   * @param {Object} request - Fastify request object.
   * @param {Object} reply - Fastify reply object.
   */
  async validateSession(request, reply) {
    const sessionId = request.cookies[auth.provider.sessionCookieName];

    try {
      const { session, user } = await auth.verifySession(sessionId);
      if (!session) {
        return reply.status(401).send({ error: 'Invalid session' });
      }
      return reply.send({ message: 'Session is valid', user });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'An error occurred during session validation' });
    }
  }
}