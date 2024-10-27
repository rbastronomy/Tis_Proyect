import { PermissionController } from '../controllers/PermissionController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';

const permissionController = new PermissionController();

export default async function permissionRoutes(fastify, options) {
  // Route to create a new permission
  fastify.post('/permissions', async (request, reply) => {
    await AuthMiddleware.validatePermissions(request, reply, ['create_permission'], ['admin']);
    if (reply.raw.writableEnded) return;

    return permissionController.create(request, reply);
  });

  // Route to get all permissions
  fastify.get('/permissions', async (request, reply) => {
    await AuthMiddleware.validatePermissions(request, reply, [], ['admin']);
    if (reply.raw.writableEnded) return;

    return permissionController.getAll(request, reply);
  });

  // Additional permission routes...
}