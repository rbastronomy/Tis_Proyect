import { db } from '../db/database.js';
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { AuthError } from './auth.js';
import cookie from 'cookie';
import process from 'process';
import { SessionModel } from '../models/SessionModel.js';
import { UserModel } from '../models/UserModel.js';

/**
 * @class AuthProvider
 * @description Custom authentication provider to replace Lucia
 */
export class AuthProvider {
    /**
     * @property {string} sessionCookieName
     * @description The name of the session cookie
     */
    sessionCookieName = 'session';

    /**
     * @method generateSessionId
     * @description Generates a unique session ID
     * @returns {string} - The generated session ID
     */
    generateSessionId() {
        const bytes = new Uint8Array(20);
        crypto.getRandomValues(bytes);
        const sessionId = encodeHexLowerCase(sha256(bytes));
        return sessionId;
    }

    /**
     * @method createSession
     * @description Creates a new session for a user
     * @param {string} userId - The ID of the user
     * @returns {Promise<object>} - The created session object
     * @throws {AuthError} - If there is an error creating the session
     */
    async createSession(userId) {
        try {
            const sessionId = this.generateSessionId();
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days from now

            await db.insert({
                id: sessionId,
                user_id: userId,
                expires_at: expiresAt
            }).into('user_session');

            return new SessionModel({
                id: sessionId,
                user_id: userId,
                expires_at: expiresAt
            });
        } catch (error) {
            console.error('Error creating session:', error);
            throw AuthError.DatabaseError(`Failed to create session: ${error.message}`);
        }
    }

    /**
     * @method validateSession
     * @description Validates a session ID
     * @param {string} sessionId - The session ID to validate
     * @returns {Promise<object>} - An object containing the session and user if valid
     * @throws {AuthError} - If the session is invalid or expired
     */
    async validateSession(sessionId) {
        try {
            const sessionData = await db.select(
                'user_session.id',
                'user_session.user_id',
                'user_session.expires_at',
                'persona.rut as user_rut',
                'persona.nombre as user_nombre',
                'persona.apellido_paterno as user_apellido_paterno',
                'persona.apellido_materno as user_apellido_materno',
                'persona.correo as user_correo',
                'roles.nombre_rol as user_role'
            )
                .from('user_session')
                .innerJoin('persona', 'user_session.user_id', 'persona.rut')
                .innerJoin('roles', 'persona.id_roles', 'roles.id_roles')
                .where('user_session.id', sessionId)
                .first();

            if (!sessionData) {
                throw AuthError.InvalidSession();
            }

            const session = new SessionModel({
                id: sessionData.id,
                user_id: sessionData.user_id,
                expires_at: sessionData.expires_at
            });

            if (session.isExpired()) {
                await this.invalidateSession(sessionId);
                throw AuthError.InvalidSession();
            }

            // Extend session if needed
            if (session.needsExtension()) {
                session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
                await db('user_session')
                    .where('id', sessionId)
                    .update({ expires_at: session.expires_at });
            }

            const user = new UserModel({
                rut: sessionData.user_rut,
                nombre: sessionData.user_nombre,
                apellido_paterno: sessionData.user_apellido_paterno,
                apellido_materno: sessionData.user_apellido_materno,
                correo: sessionData.user_correo,
                role: sessionData.user_role
            });

            session.user = user;

            return { session, user };
        } catch (error) {
            console.error('Error validating session:', error);
            if (error instanceof AuthError) {
                throw error;
            }
            throw AuthError.InvalidSession();
        }
    }

    /**
     * @method invalidateSession
     * @description Invalidates a session
     * @param {string} sessionId - The session ID to invalidate
     * @returns {Promise<void>}
     * @throws {AuthError} - If there is an error invalidating the session
     */
    async invalidateSession(sessionId) {
        try {
            await db('user_session').where('id', sessionId).del();
        } catch (error) {
            console.error('Error invalidating session:', error);
            throw AuthError.DatabaseError(`Failed to invalidate session: ${error.message}`);
        }
    }

    /**
     * @method invalidateUserSessions
     * @description Invalidates all sessions for a user
     * @param {string} userId - The ID of the user
     * @returns {Promise<void>}
     * @throws {AuthError} - If there is an error invalidating the sessions
     */
    async invalidateUserSessions(userId) {
        try {
            await db('user_session').where('user_id', userId).del();
        } catch (error) {
            console.error('Error invalidating user sessions:', error);
            throw AuthError.DatabaseError(`Failed to invalidate user sessions: ${error.message}`);
        }
    }

    /**
     * @method createSessionCookie
     * @description Creates a session cookie string
     * @param {string} sessionId - The session ID
     * @returns {string} - The session cookie string
     */
    createSessionCookie(sessionId) {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieAttributes = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            domain: process.env.COOKIE_DOMAIN || undefined,
            path: '/',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        };

        return cookie.serialize('session', sessionId, cookieAttributes);
    }

    /**
     * @method readSessionCookie
     * @description Reads the session ID from the cookie header
     * @param {string} cookieHeader - The cookie header string
     * @returns {string|null} - The session ID or null if not found
     */
    readSessionCookie(cookieHeader) {
        const cookies = cookie.parse(cookieHeader);
        return cookies.session || null;
    }

    /**
     * @method getSessionCookieName
     * @description Returns the name of the session cookie
     * @returns {string} - The name of the session cookie
     */
    getSessionCookieName() {
        return this.sessionCookieName;
    }
}

export default AuthProvider;
