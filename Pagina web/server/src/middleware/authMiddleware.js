import auth from '../auth/auth.js';

export class AuthMiddleware {
    static async verifySession(request) {
        const sessionId = request.cookies[auth.provider.sessionCookieName];
        if (!sessionId) {
            throw { statusCode: 401, message: 'Unauthorized' };
        }

        const { session, user } = await auth.verifySession(sessionId);
        if (!session || !user) {
            throw { statusCode: 401, message: 'Invalid session' };
        }

        return user;
    }

    static validatePermissions(user, permissions = [], roles = []) {
        // Check for required roles
        if (roles.length > 0) {
            const hasRequiredRole = roles.some(role => user.roles.includes(role));
            if (!hasRequiredRole) {
                throw { statusCode: 403, message: 'Forbidden: Insufficient role' };
            }
        }

        // Check for required permissions
        if (permissions.length > 0) {
            const hasRequiredPermission = permissions.some(permission => 
                user.permissions.includes(permission)
            );
            if (!hasRequiredPermission) {
                throw { statusCode: 403, message: 'Forbidden: Insufficient permissions' };
            }
        }

        return true;
    }
}
