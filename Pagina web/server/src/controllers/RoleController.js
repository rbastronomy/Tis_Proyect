import { BaseController } from '../core/BaseController.js';
import { RoleService } from '../services/RoleService.js';

const roleService = new RoleService();

export class RoleController extends BaseController {
    constructor() {
        super(roleService);
    }

    /**
   * Creates a new role.
   * @param {Object} request - Fastify request object.
   * @param {Object} reply - Fastify reply object.
   */
    async create(request, reply) {
        const { name, description } = request.body;

        try {
        const newRole = await roleService.create({ name, description });
        return reply.status(201).send({ message: 'Role created successfully', role: newRole });
        } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to create role' });
        }
    }

    /**
   * Assigns a permission to a role.
   * @param {Object} request - Fastify request object.
   * @param {Object} reply - Fastify reply object.
   */
    async assignPermission(request, reply) {
        const { roleId } = request.params;
        const { permissionId } = request.body;

        try {
            await roleService.assignPermission(roleId, permissionId);
            return reply.send({ message: 'Permission assigned to role successfully' });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to assign permission to role' });
        }
    }

    /**
   * Removes a permission from a role.
   * @param {Object} request - Fastify request object.
   * @param {Object} reply - Fastify reply object.
   */
    async removePermission(request, reply) {
        const { roleId, permissionId } = request.params;

    try {
      await roleService.removePermission(roleId, permissionId);
      return reply.send({ message: 'Permission removed from role successfully' });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to remove permission from role' });
        }
    }   

    /**
   * Retrieves all roles.
   * @param {Object} request - Fastify request object.
   * @param {Object} reply - Fastify reply object.
   */
    async getAll(request, reply) {
        try {
        const roles = await roleService.getAll();
        return reply.send({ roles });
        } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to retrieve roles' });
        }
    }
    // Additional role-specific endpoints if needed
}
