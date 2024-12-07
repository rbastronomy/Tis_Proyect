import { BaseService } from '../core/BaseService.js';
import { RoleRepository } from '../repository/RoleRepository.js';
import { PermissionService } from './PermissionService.js';
import { RoleModel } from '../models/RoleModel.js';
export class RoleService extends BaseService {
    constructor() {
        const roleRepository = new RoleRepository();
        super(roleRepository);
        this.permissionService = new PermissionService();
    }

    /**
     * Get permissions for a role
     * @param {string} roleId - The role ID
     * @returns {Promise<Array>} Array of permissions
     */
    async getPermissions(roleId) {
        const role = await this.roleRepository.findById(roleId);
        if (!role) return [];

        const permissionIds = role.permissions.map(p => p.idpermisos);
        const permissions = await Promise.all(
            permissionIds.map(id => this.permissionService.findById(id))
        );

        return permissions.filter(p => p !== null);
    }

    /**
     * Assign permission to role
     * @param {string} roleId - The role ID
     * @param {string} permissionId - The permission ID
     * @returns {Promise<void>}
     */
    async assignPermission(roleId, permissionId) {
        // Verify permission exists before assigning
        const permission = await this.permissionService.findById(permissionId);
        if (!permission) {
            throw new Error('Permission not found');
        }

        return this.roleRepository.assignPermission(roleId, permissionId);
    }

    /**
     * Remove permission from role
     * @param {string} roleId - The role ID
     * @param {string} permissionId - The permission ID
     * @returns {Promise<void>}
     */
    async removePermission(roleId, permissionId) {
        // Verify permission exists before removing
        const permission = await this.permissionService.findById(permissionId);
        if (!permission) {
            throw new Error('Permission not found');
        }

        return this.roleRepository.removePermission(roleId, permissionId);
    }

    /**
     * Find role by ID with permissions
     * @param {string} id - Role ID
     * @returns {Promise<RoleModel|null>}
     */
    async findById(id) {
        const roleData = await this.roleRepository.findById(id);
        if (!roleData) return null;

        // Get full permission objects using PermissionService
        const permissions = await this.permissionService.getPermissionsForRole(roleData.idroles);
        
        const role = RoleModel.toModel(roleData);
        

        role.permissions = permissions;
        return role;
    }

    /**
     * Create a new role
     * @param {Object} roleData - The role data
     * @returns {Promise<RoleModel>}
     */
    async create(roleData) {
        // Verify all permissions exist before creating role
        if (roleData.permissions?.length) {
            await Promise.all(
                roleData.permissions.map(async permissionId => {
                    const permission = await this.permissionService.findById(permissionId);
                    if (!permission) {
                        throw new Error(`Permission ${permissionId} not found`);
                    }
                })
            );
        }

        return this.roleRepository.create(roleData);
    }

    /**
     * Find role by name
     * @param {string} name - Role name
     * @returns {Promise<RoleModel|null>}
     */
    async findByName(name) {
        const role = await this.roleRepository.findByName(name);
        if (!role) return null;

        // Get full permission objects using PermissionService
        const permissions = await this.getPermissions(role.idroles);
        return {
            ...role,
            permissions
        };
    }
}
