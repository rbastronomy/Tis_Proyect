import AuthProvider from './AuthProvider.js';
import dotenv from 'dotenv';
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

    static Forbidden() {
        return new AuthError('Forbidden', 'FORBIDDEN');
    }
}

class Auth {
    provider;
    userRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.provider = new AuthProvider();
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
            const session = await this.provider.createSession(userId);
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