import { BaseService } from '../core/BaseService.js';
import RoleRepository from '../repository/RoleRespository.js';

export class RoleService extends BaseService {
    constructor() {
        const roleRepository = new RoleRepository();
        super(roleRepository);
    }

    /**
     * Get permissions for a role
     * @param {string} roleId - The role ID
     * @returns {Promise<Array>} Array of permissions
     */
    async getPermissions(roleId) {
        return this.repository.getPermissions(roleId);
    }

    /**
     * Assign permission to role
     * @param {string} roleId - The role ID
     * @param {string} permissionId - The permission ID
     * @returns {Promise<void>}
     */
    async assignPermission(roleId, permissionId) {
        return this.repository.assignPermission(roleId, permissionId);
    }

    /**
     * Remove permission from role
     * @param {string} roleId - The role ID
     * @param {string} permissionId - The permission ID
     * @returns {Promise<void>}
     */
    async removePermission(roleId, permissionId) {
        return this.repository.removePermission(roleId, permissionId);
    }

    /**
     * Create a new role
     * @param {Object} roleData - The role data
     * @returns {Promise<RoleModel>}
     */
    async create(roleData) {
        // Add any validation logic here
        return this.repository.create(roleData);
    }

    /**
     * Find role by name
     * @param {string} name - Role name
     * @returns {Promise<RoleModel|null>}
     */
    async findByName(name) {
        return this.repository.findByName(name);
    }
}
