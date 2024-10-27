// Pagina web/server/src/routes/roleRoutes.js
import { RoleController } from '../controllers/RoleController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';

const roleController = new RoleController();

export default async function roleRoutes(fastify, options) {
    // Route to create a new role
    fastify.post('/roles', async (request, reply) => {
        await AuthMiddleware.validatePermissions(request, reply, ['create_role'], ['admin']);
        if (reply.raw.writableEnded) return;

        return roleController.create(request, reply);
    });

    // Route to assign a permission to a role
    fastify.post('/roles/:roleId/permissions', async (request, reply) => {
        const { roleId } = request.params;
        const { permissionId } = request.body;

        await AuthMiddleware.validatePermissions(request, reply, ['assign_permission'], ['admin']);
        if (reply.raw.writableEnded) return;

        try {
        await roleController.assignPermission(request, reply);
        return reply.send({ message: 'Permission assigned to role successfully' });
        } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to assign permission to role' });
        }
    });

  fastify.delete('/roles/:roleId/permissions/:permissionId', async (request, reply) => {
    const { roleId, permissionId } = request.params;

    await AuthMiddleware.validatePermissions(request, reply, ['remove_permission'], ['admin']);
    if (reply.raw.writableEnded) return;

    try {
      await roleController.removePermission(request, reply);
      return reply.send({ message: 'Permission removed from role successfully' });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to remove permission from role' });
    }
  });

  // Route to get all roles
  fastify.get('/roles', async (request, reply) => {
    await AuthMiddleware.validatePermissions(request, reply, [], ['admin']);
    if (reply.raw.writableEnded) return;

    return roleController.getAll(request, reply);
  });

  // Additional role routes...
}