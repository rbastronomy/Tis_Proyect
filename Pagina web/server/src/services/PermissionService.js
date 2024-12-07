import { BaseService } from '../core/BaseService.js';
import PermissionRepository from '../repository/PermissionRepository.js';
import { PermissionModel } from '../models/PermissionModel.js';

export class PermissionService extends BaseService {
    constructor() {
        const permissionRepository = new PermissionRepository();
        super(permissionRepository);
    }

    /**
     * Create a new permission
     * @param {Object} permissionData - The permission data
     * @returns {Promise<PermissionModel>}
     */
    async create(permissionData) {
        // Add any validation logic here
        return this.repository.create(permissionData);
    }

    /**
     * Find permission by name
     * @param {string} name - Permission name
     * @returns {Promise<PermissionModel|null>}
     */
    async findByName(name) {
        return this.repository.findByName(name);
    }

    /**
     * Soft delete a permission
     * @param {string} idpermiso - Permission ID
     * @returns {Promise<PermissionModel|null>}
     */
    async softDelete(idpermiso) {
        return this.repository.softDelete(idpermiso);
    }

    /**
     * Find permission by ID
     * @param {string} id - Permission ID
     * @returns {Promise<PermissionModel|null>}
     */
    async findById(id) {
        return this.repository.findById(id);
    }

    /**
     * Get permissions for a role
     * @param {string} roleId - Role ID
     * @returns {Promise<PermissionModel[]>}
     */
    async getPermissionsForRole(roleId) {
       const permissions = await this.repository.findByRole(roleId);
       return PermissionModel.toModels(permissions);
    }
}
