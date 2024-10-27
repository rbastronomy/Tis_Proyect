import { BaseController } from '../core/BaseController.js';
import { PermissionService } from '../services/PermissionService.js';

const permissionService = new PermissionService();

export class PermissionController extends BaseController {
    constructor() {
        super(permissionService);
    }

    
    /**
     * Creates a new permission.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async create(request, reply) {
        const { name, description } = request.body;

        try {
        const newPermission = await permissionService.create({ name, description });
        return reply.status(201).send({ message: 'Permission created successfully', permission: newPermission });
        } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to create permission' });
        }
    }
  
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
    // Additional permission-specific endpoints if needed
}
