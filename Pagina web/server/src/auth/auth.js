import { Lucia} from 'lucia';
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import { db } from '../db/database.js';
import dotenv from 'dotenv';
import process from 'process';
import pg from 'pg';

dotenv.config();

class Auth {
    provider;

    constructor() {
        // Create a new pg pool using the same connection details as Knex
        const pgPool = new pg.Pool(db.client.config.connection);

        // Create the adapter using the pg pool
        const adapter = new NodePostgresAdapter(pgPool, {
        user: 'auth_user',
        session: 'user_session',
        });

        const isProduction = process.env.NODE_ENV === 'production';

        this.provider = new Lucia(adapter, {
            env: isProduction ? 'PROD' : 'DEV',
            sessionCookie: {
                attributes: {
                    secure: isProduction,
                },
            },
            getUserAttributes: async (user) => {
                // Fetch roles and permissions
                const roles = await db('user_roles')
                .join('roles', 'user_roles.role_id', 'roles.id')
                .where('user_roles.user_id', user.id)
                .select('roles.name');

                const permissions = await db('user_roles')
                .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
                .join('permissions', 'role_permissions.permission_id', 'permissions.id')
                .where('user_roles.user_id', user.id)
                .select('permissions.name');

                return {
                username: user.username,
                email: user.email,
                roles: roles.map((role) => role.name),
                permissions: permissions.map((permission) => permission.name),
                };
            }
        });
    }


    /**
   * Verifies a user session.
   * @param {string} sessionId - The session ID.
   * @returns {Object} - The session and user information.
   */
    static verifySession = async (sessionId) => {
        const { session, user } = await this.provider.validateSession(sessionId);
        return { session, user };
    }

  /**
   * Creates a new session for a user.
   * @param {number} userId - The user's ID.
   * @param {Object} additionalAttributes - Additional session attributes.
   * @returns {Object} - The created session.
   */
  async createSession(userId, additionalAttributes = {}) {
    return await this.provider.createSession(userId, additionalAttributes);
  }

  /**
   * Invalidates a user session.
   * @param {string} sessionId - The session ID.
   */
  async invalidateSession(sessionId) {
    await this.provider.invalidateSession(sessionId);
  }

  /**
   * Invalidates all sessions for a user.
   * @param {number} userId - The user's ID.
   */
  async invalidateAllSessions(userId) {
    await this.provider.invalidateUserSessions(userId);
  }

  /**
   * Checks if a user has a specific permission.
   * @param {Object} user - The user object.
   * @param {string} permission - The required permission.
   * @returns {boolean} - True if the user has the permission.
   */
  hasPermission(user, permission) {
    return user.permissions.includes(permission);
  }

  /**
   * Checks if a user has a specific role.
   * @param {Object} user - The user object.
   * @param {string} role - The required role.
   * @returns {boolean} - True if the user has the role.
   */
  hasRole(user, role) {
    return user.roles.includes(role);
  }
}

const authInstance = new Auth();
Object.freeze(authInstance);

export default authInstance;