import { Lucia } from 'lucia';
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
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

        const adapter = new NodePostgresAdapter(pgPool, {
            user: 'persona',
            session: 'user_session',
            getUserAttributes: (attributes) => ({
                rut: attributes.rut,
                nombre: attributes.nombre,
                correo: attributes.correo,
                idroles: attributes.idroles
            })
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
                try {
                    const userModel = await this.userRepository.findByRut(user.rut);
                    if (!userModel) {
                        throw AuthError.UserNotFound();
                    }

                    return {
                        rut: userModel.rut,
                        nombre: userModel.nombre,
                        correo: userModel.correo,
                        role: userModel.role?.toJSON()
                    };
                } catch (error) {
                    if (error instanceof AuthError) throw error;
                    throw AuthError.DatabaseError(error.message);
                }
            }
        });
    }

    async verifySession(sessionId) {
        try {
            const { session, user } = await this.provider.validateSession(sessionId);
            if (!session) throw AuthError.InvalidSession();
            return { session, user };
        } catch (error) {
            if (error instanceof AuthError) throw error;
            throw AuthError.InvalidSession();
        }
    }

    async createSession(userId, attributes = {}) {
        try {
            return await this.provider.createSession(userId, attributes);
        } catch (error) {
            throw AuthError.DatabaseError('Failed to create session');
        }
    }

    async invalidateSession(sessionId) {
        try {
            await this.provider.invalidateSession(sessionId);
        } catch (error) {
            throw AuthError.DatabaseError('Failed to invalidate session');
        }
    }

    async invalidateAllSessions(userId) {
        try {
            await this.provider.invalidateUserSessions(userId);
        } catch (error) {
            throw AuthError.DatabaseError('Failed to invalidate all sessions');
        }
    }

    createSessionCookie(session) {
        return this.provider.createSessionCookie(session);
    }
}

const authInstance = new Auth();
Object.freeze(authInstance);

export default authInstance;