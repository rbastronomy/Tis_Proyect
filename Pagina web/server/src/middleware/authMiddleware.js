import { AuthService } from '../services/AuthService.js';
import { UserService } from '../services/UserService.js';

export class AuthMiddleware {
    
    static async verifySession(request) {
        const authService = new AuthService(new UserService());
        const cookieHeader = request.headers.cookie || '';
        const sessionId = authService.auth.provider.readSessionCookie(cookieHeader);
        if (!sessionId) {
            throw { statusCode: 401, message: 'Unauthorized' };
        }
        const { session, user } = await authService.validateSession(sessionId);
        if (!session || !user) {
            throw { statusCode: 401, message: 'Invalid session' };
        }

        return user;
    }

    /**
     * Validates if a user has the required roles and permissions
     * @param {Object} user - User object with role and permissions
     * @param {string[]} permissions - Array of required permission names
     * @param {string[]} roles - Array of required role names
     * @returns {boolean} True if user has required permissions/roles
     * @throws {Object} Error object with statusCode and message
     */
    static validatePermissions(user, permissions = [], roles = []) {
        // Check if user has role object
        if (!user.role) {
            throw { 
                statusCode: 403, 
                message: 'Forbidden: User has no role assigned' 
            };
        }

        // Check for required roles
        if (roles.length > 0) {
            const hasRequiredRole = roles.some(role => 
                user.role.nombre_rol.toLowerCase() === role.toLowerCase()
            );
            
            if (!hasRequiredRole) {
                throw { 
                    statusCode: 403, 
                    message: 'Forbidden: Insufficient role' 
                };
            }
        }

        // Check if user has permissions array
        if (!Array.isArray(user.permissions)) {
            throw { 
                statusCode: 403, 
                message: 'Forbidden: User has no permissions' 
            };
        }

        // Check for required permissions
        if (permissions.length > 0) {
            const hasRequiredPermission = permissions.some(requiredPermission => 
                user.permissions.some(userPermission => 
                    userPermission.toLowerCase() === requiredPermission.toLowerCase()
                )
            );

            if (!hasRequiredPermission) {
                throw { 
                    statusCode: 403, 
                    message: 'Forbidden: Insufficient permissions' 
                };
            }
        }

        return true;
    }
}
