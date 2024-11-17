import { BaseController } from '../core/BaseController.js';
import { PermissionService } from '../services/PermissionService.js';

const permissionService = new PermissionService();

export class PermissionController extends BaseController {
    constructor() {
        super(permissionService);
    }

    // CREATE operations
    /**
     * Creates a new permission.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async create(request, reply) {
        const { name, description } = request.body;

        try {
            const newPermission = await permissionService.create({ name, description });
            return reply.status(201).send({ 
                message: 'Permission created successfully', 
                permission: newPermission 
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to create permission' });
        }
    }

    // READ operations
    /**
     * Retrieves all permissions.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async getAll(request, reply) {
        try {
            const permissions = await permissionService.getAll();
            return reply.send({ permissions });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retrieve permissions' });
        }
    }

    /**
     * Retrieves a permission by ID.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async getById(request, reply) {
        try {
            const { id } = request.params;
            const permission = await permissionService.getById(id);
            
            if (!permission) {
                return reply.status(404).send({ error: 'Permission not found' });
            }
            
            return reply.send({ permission });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retrieve permission' });
        }
    }

    /**
     * Retrieves permissions grouped by category.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async getGroupedByCategory(request, reply) {
        try {
            const groupedPermissions = await permissionService.getGroupedByCategory();
            return reply.send({ permissions: groupedPermissions });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retrieve grouped permissions' });
        }
    }

    // UPDATE operations
    /**
     * Updates a permission by ID.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async update(request, reply) {
        try {
            const { id } = request.params;
            const updateData = request.body;
            
            const updatedPermission = await permissionService.update(id, updateData);
            return reply.send({ 
                message: 'Permission updated successfully', 
                permission: updatedPermission 
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to update permission' });
        }
    }

    // DELETE operations
    /**
     * Deletes a permission and its associations.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async delete(request, reply) {
        try {
            const { id } = request.params;
            await permissionService.deleteWithAssociations(id);
            return reply.send({ message: 'Permission deleted successfully' });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to delete permission' });
        }
    }

    // RELATIONSHIP operations
    /**
     * Gets all roles associated with a permission.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async getRoles(request, reply) {
        try {
            const { id } = request.params;
            const roles = await permissionService.getRoles(id);
            return reply.send({ roles });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retrieve roles' });
        }
    }

    /**
     * Gets all users associated with a permission.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async getUsers(request, reply) {
        try {
            const { id } = request.params;
            const users = await permissionService.getUsers(id);
            return reply.send({ users });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retrieve users' });
        }
    }
}