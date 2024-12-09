import { Lucia } from 'lucia';
import { CustomPostgresAdapter } from './CustomPostgresAdapter.js';
import { db } from '../db/database.js';
import dotenv from 'dotenv';
import process from 'process';
import pg from 'pg';
import UserRepository from '../repository/UserRepository.js';

dotenv.config();

// Custom error class for auth-related errors
export class AuthError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'AuthError';
        this.code = code;
    }

    static InvalidCredentials() {
        return new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    static UserNotFound() {
        return new AuthError('User not found', 'USER_NOT_FOUND');
    }

    static UserExists() {
        return new AuthError('User already exists', 'USER_EXISTS');
    }

    static InvalidSession() {
        return new AuthError('Invalid session', 'INVALID_SESSION');
    }

    static DatabaseError(message) {
        return new AuthError(message, 'DATABASE_ERROR');
    }
}

class Auth {
    provider;
    userRepository;

    constructor() {
        this.userRepository = new UserRepository();
        const pgPool = new pg.Pool(db.client.config.connection);

        const adapter = new CustomPostgresAdapter(pgPool, {
            user: 'persona',
            session: 'user_session'
        });

        const isProduction = process.env.NODE_ENV === 'production';

        this.provider = new Lucia(adapter, {
            env: isProduction ? 'PROD' : 'DEV',
            sessionCookie: {
                attributes: {
                    secure: isProduction,
                    sameSite: 'lax',
                    domain: process.env.COOKIE_DOMAIN || undefined,
                    path: '/'
                }
            },
            getUserAttributes: (attributes) => ({
                rut: attributes.id,
                nombre: attributes.nombre,
                apellido_paterno: attributes.apellido_paterno,
                apellido_materno: attributes.apellido_materno,
                correo: attributes.correo,
                role: attributes.role
            })
        });
    }

    async verifySession(sessionId) {
        try {
            if (!sessionId || typeof sessionId !== 'string') {
                console.log('Invalid session ID type or value:', sessionId);
                throw AuthError.InvalidSession();
            }

            const { session, user } = await this.provider.validateSession(sessionId);
            
            if (!session || !user) {
                console.log('Invalid session result:', { session, user });
                throw AuthError.InvalidSession();
            }

            return { session, user };
        } catch (error) {
            console.error('Session verification error:', {
                message: error.message,
                code: error.code,
                stack: error.stack,
                name: error.name
            });
            throw error instanceof AuthError ? error : AuthError.InvalidSession();
        }
    }

    async createSession(userId) {
        try {
            const stringUserId = userId.toString();
            const session = await this.provider.createSession(stringUserId);

            return session;
        } catch (error) {
            console.error('Detailed session creation error:', {
                error: error.message,
                stack: error.stack,
                code: error.code,
                detail: error.detail,
                position: error.position,
                routine: error.routine
            });
            
            if (error.query) {
                console.error('Failed SQL Query:', error.query);
            }

            throw AuthError.DatabaseError(`Failed to create session: ${error.message}`);
        }
    }

    async invalidateSession(sessionId) {
        try {
            await this.provider.invalidateSession(sessionId);
        } catch (error) {
            throw AuthError.DatabaseError(`Failed to invalidate session: ${error.message}`);
        }
    }

    async invalidateAllSessions(userId) {
        try {
            await this.provider.invalidateUserSessions(userId);
        } catch (error) {
            throw AuthError.DatabaseError(`Failed to invalidate all sessions: ${error.message}`);
        }
    }

    createSessionCookie(session) {
        return this.provider.createSessionCookie(session.id);
    }
}

const authInstance = new Auth();
Object.freeze(authInstance);

export default authInstance;