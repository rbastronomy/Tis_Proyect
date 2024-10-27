// Pagina web/server/src/routes/userRoutes.js
import { UserController } from '../controllers/UserController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';

const userController = new UserController();

export default async function userRoutes(fastify, options) {
    // Route to get all users (admin only)
    fastify.get('/users', async (request, reply) => {
        try {
            const user = await AuthMiddleware.verifySession(request);
            AuthMiddleware.validatePermissions(user, [], ['admin']);
            
            return userController.getAll(request, reply);
        } catch (error) {
            return reply.status(error.statusCode || 500)
                       .send({ error: error.message || 'Internal server error' });
        }
    });

    // Route to create a new user
    fastify.post('/users', async (request, reply) => {
        try {
            const user = await AuthMiddleware.verifySession(request);
            AuthMiddleware.validatePermissions(user, ['create_user'], []);
            
            return userController.create(request, reply);
        } catch (error) {
            return reply.status(error.statusCode || 500)
                       .send({ error: error.message || 'Internal server error' });
        }
    });

    // Route to get user details
    fastify.get('/users/:userId', async (request, reply) => {
        try {
            const user = await AuthMiddleware.verifySession(request);
            const { userId } = request.params;
            
            // Special case for user details - allow admin or self
            if (!user.roles.includes('admin') && user.id !== parseInt(userId)) {
                throw { statusCode: 403, message: 'Forbidden: Insufficient permissions' };
            }
            
            return userController.getUserDetails(request, reply);
        } catch (error) {
            return reply.status(error.statusCode || 500)
                       .send({ error: error.message || 'Internal server error' });
        }
    });

    // Additional user routes...
}
