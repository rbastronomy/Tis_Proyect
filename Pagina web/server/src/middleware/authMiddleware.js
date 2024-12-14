import { AuthService } from '../services/AuthService.js';
import { UserService } from '../services/UserService.js';
import { AuthError } from '../auth/auth.js';

/**
 * @typedef {import('../models/UserModel.js').UserModel} UserModel
 */

export class AuthMiddleware {
  /**
   * Verifies user session and attaches user to request
   * @param {Object} request - Fastify request object
   * @returns {Promise<UserModel>} - User model
   * @throws {AuthError} - If session is invalid
   */
  static async verifySession(request) {
    const authService = new AuthService(new UserService());
    const cookieHeader = request.headers.cookie || '';
    const sessionId = authService.auth.provider.readSessionCookie(cookieHeader);

    if (!sessionId) {
      console.log('No valid session cookie found');
      throw AuthError.InvalidSession();
    }

    const { session, user } = await authService.validateSession(sessionId);
    if (!session || !user) {
      throw AuthError.InvalidSession();
    }

    return user;
  }

  /**
   * Validates user permissions against required permissions
   * Administrators bypass permission checks
   * @param {UserModel} user - User model
   * @param {string[]} requiredPermissions - Array of required permissions
   * @param {string[]} requiredRoles - Array of required roles
   * @throws {AuthError} - If user does not have required permissions
   */
  static validatePermissions(user, requiredPermissions, requiredRoles) {
    // If user has ADMINISTRADOR role, bypass all permission checks
    if (user.hasRoles(['ADMINISTRADOR'])) {
      return;
    }

    // For non-admin users, check both permissions and roles
    if (!user.hasPermissions(requiredPermissions) || !user.hasRoles(requiredRoles)) {
      throw AuthError.Forbidden();
    }
  }
}