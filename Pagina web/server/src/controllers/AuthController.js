import { UserService } from '../services/UserService.js';
import { AuthError } from '../auth/auth.js';
import dotenv from 'dotenv';

dotenv.config();

export class AuthController {
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Handles user login
   * @param {Object} request - Fastify request object containing login credentials
   * @param {Object} request.body - Request body
   * @param {string} request.body.identifier - Username or email
   * @param {string} request.body.password - User password
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object containing user data and session info
   * @throws {AuthError} When login credentials are invalid
   */
  async login(request, reply) {
    const { identifier, password } = request.body;

    try {
      const { user, session } = await this.userService.login(identifier, password);
      
      const sessionCookie = this.userService.auth.createSessionCookie(session);
      reply.header('Set-Cookie', sessionCookie.serialize());
      
      return reply.send({ 
        message: 'Login successful', 
        user: user.toJSON(),
        role: user.role,
        permissions: user.permissions
      });
    } catch (error) {
      console.error('Login error:', error);
      request.log.error(error);
      
      if (error instanceof AuthError) {
        return reply.status(401).send({ 
          error: error.message,
          code: error.code 
        });
      }
      
      return reply.status(500).send({ error: 'An error occurred during login' });
    }
  }

  /**
   * Handles user registration
   * @param {Object} request - Fastify request object
   * @param {Object} request.body - Registration data
   * @param {string} request.body.username - Username
   * @param {string} request.body.email - User email
   * @param {string} request.body.password - User password
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object containing new user data
   * @throws {AuthError} When registration fails
   */
  async register(request, reply) {
    try {
      const { user, session } = await this.userService.register(request.body);
      
      const sessionCookie = this.userService.auth.createSessionCookie(session);
      reply.header('Set-Cookie', sessionCookie.serialize());

      return reply.send({ 
        message: 'Registration successful', 
        user: user.toJSON() 
      });
    } catch (error) {
      if (error.message === 'User already exists') {
        return reply.status(400).send({ error: error.message });
      }
      if (error instanceof AuthError) {
        return reply.status(400).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'An error occurred during registration' });
    }
  }

  /**
   * Handles user logout
   * @param {Object} request - Fastify request object
   * @param {Object} request.cookies - Request cookies containing session ID
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response confirming successful logout
   * @throws {Error} When logout fails
   */
  async logout(request, reply) {
    const sessionId = request.cookies[this.userService.auth.provider.sessionCookieName];

    try {
      await this.userService.logout(sessionId);
      reply.clearCookie(this.userService.auth.provider.sessionCookieName);
      return reply.send({ message: 'Logout successful' });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'An error occurred during logout' });
    }
  }

  /**
   * Validates user session
   * @param {Object} request - Fastify request object
   * @param {Object} request.cookies - Request cookies containing session ID
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response containing session validation status and user data
   * @throws {Error} When session validation fails
   */
  async validateSession(request, reply) {
    const sessionId = request.cookies[this.userService.auth.provider.sessionCookieName];

    try {
      const session = await this.userService.validateSession(sessionId);
      if (!session) {
        return reply.status(401).send({ error: 'Invalid session' });
      }
      return reply.send({ message: 'Session is valid', user: session.user });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'An error occurred during session validation' });
    }
  }
}