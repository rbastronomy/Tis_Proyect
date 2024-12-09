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
     * @param {Object} user - User object with role
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
                user.role.nombre.toLowerCase() === role.toLowerCase()
            );
            
            if (!hasRequiredRole) {
                throw { 
                    statusCode: 403, 
                    message: 'Forbidden: Insufficient role' 
                };
            }
        }
        // Check for required permissions through role's permission models
        if (permissions.length > 0) {
            // Ensure role has permissions array
            if (!Array.isArray(user.role.permissions)) {
                throw { 
                    statusCode: 403, 
                    message: 'Forbidden: Role has no permissions' 
                };
            }

            const hasRequiredPermission = permissions.some(requiredPermission => 
                user.role.permissions.some(permissionModel => 
                    permissionModel.nombre.toLowerCase() === requiredPermission.toLowerCase()
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
