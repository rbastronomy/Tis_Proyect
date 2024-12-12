import { UserService } from '../services/UserService.js';
import { AuthService } from '../services/AuthService.js';
import { AuthError } from '../auth/auth.js';
import dotenv from 'dotenv';
import { clearCookie } from '../utils/cookieUtils.js';


dotenv.config();

export class AuthController {
  constructor() {
    this.userService = new UserService();
    this.authService = new AuthService(this.userService);
  }

  /**
   * Handles user registration
   * @param {Object} request - Fastify request object
   * @param {Object} request.body - Registration data including:
   * @param {string} request.body.rut - User's RUT
   * @param {string} request.body.nombre - User's name
   * @param {string} request.body.correo - User's email
   * @param {string} request.body.telefono - User's phone
   * @param {string} request.body.nacionalidad - User's nationality
   * @param {string} request.body.genero - User's gender
   * @param {string} request.body.contrasena - User's password
   * @param {Date} request.body.fecha_contratacion - Driver's hire date (optional)
   * @param {Date} request.body.licencia_conducir - Driver's license expiry (optional)
   * @param {number} request.body.id_roles - User's role ID
   * @param {boolean} [request.body.createSession=true] - Whether to create a session
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object containing new user data
   * @throws {AuthError} When registration fails
   */
  async register(request, reply) {
    try {
      // Validate required fields based on role
      const isDriver = request.body.id_roles === 3; // Assuming 3 is the driver role ID
      if (isDriver) {
        const requiredFields = [
          'rut', 
          'nombre', 
          'correo', 
          'telefono', 
          'nacionalidad', 
          'genero',
          'contrasena',
          'fecha_contratacion',
          'licencia_conducir'
        ];

        const missingFields = requiredFields.filter(field => !request.body[field]);
        if (missingFields.length > 0) {
          return reply.status(400).send({ 
            error: `Missing required fields: ${missingFields.join(', ')}` 
          });
        }
      }

      // Only create session if explicitly requested (default true for backward compatibility)
      const createSession = request.body.createSession !== false;
      const { user, session } = await this.authService.register(request.body, createSession);
      
      // Only set cookie if session was created
      if (createSession && session) {
        const sessionCookie = this.authService.auth.createSessionCookie(session);
        reply.header('Set-Cookie', sessionCookie.serialize());
      }

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
   * Handles user login
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object containing user data and session
   * @throws {AuthError} When login fails
   */
  async login(request, reply) {
    try {
      const { correo, contrasena } = request.body;
      console.log('Login attempt with email:', correo);
      const { user, session } = await this.authService.login(correo, contrasena);
      
      const sessionCookie = this.authService.auth.createSessionCookie(session);
      reply.header('Set-Cookie', sessionCookie);
      
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
   * Handles user logout
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response confirming successful logout
   */
  async logout(request, reply) {
    try {
      const cookieHeader = request.headers.cookie || '';
      console.log('Cookie header:', cookieHeader);

      const sessionId = this.authService.auth.provider.readSessionCookie(cookieHeader);

      if (!sessionId) {
        return reply.status(401).send({ error: 'No session found' });
      }

      await this.authService.logout(sessionId);

      // Clear the session cookie using the cookie name from the provider
      const cookieName = this.authService.auth.provider.getSessionCookieName();
      clearCookie(reply, cookieName);

      return reply.send({ message: 'Logout successful' });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'An error occurred during logout' });
    }
  }

  /**
   * Validates user session
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response containing session validation status and user data
   */
  async validateSession(request, reply) {
    try {
      // Get the raw cookie header string
      const cookieHeader = request.headers.cookie || '';
      console.log('Cookie header:', cookieHeader);
      
      // Extract just the session cookie value, not the entire cookie object
      const sessionId = this.authService.auth.provider.readSessionCookie(cookieHeader);
      
      if (!sessionId) {
        console.log('No valid session cookie found');
        return reply.status(401).send({ error: 'No session found' });
      }

      // Log the actual session ID string
      console.log('Session ID from cookie:', sessionId);

      const { session, user } = await this.authService.validateSession(sessionId);
      if (!session) {
        return reply.status(401).send({ error: 'Invalid session' });
      }
      
      return reply.send({ 
        message: 'Session is valid', 
        user: user.toJSON() 
      });
    } catch (error) {
      console.error('Session validation error:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      if (error.code === 'INVALID_SESSION') {
        return reply.status(401).send({ error: 'Invalid session' });
      }
      
      return reply.status(500).send({ error: 'An error occurred during session validation' });
    }
  }
}