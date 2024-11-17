import { BaseModel } from '../core/BaseModel.js';

export class PermissionModel extends BaseModel {
    constructor() {
        super('permissions');
    }

    /**
     * Creates a new permission.
     * @param {Object} data - Permission data (name, description).
     * @returns {Object} - The created permission.
     */
    async create(data) {
        return super.create(data);
    }

    /**
     * Updates an existing permission.
     * @param {number} id - Permission ID.
     * @param {Object} data - Updated permission data.
     * @returns {Object} - The updated permission.
     */
    async update(id, data) {
        return super.update(id, data);
    }

    /**
     * Retrieves a permission by its name.
     * @param {string} permissionName - The permission's name.
     * @returns {Object|null} - The permission object or null.
     */
    async getByName(permissionName) {
        return this.db(this.tableName)
            .where({ name: permissionName })
            .first();
    }

    /**
     * Retrieves all roles that have a specific permission.
     * @param {number} permissionId - The permission's ID.
     * @returns {Array} - List of roles.
     */
    async getRoles(permissionId) {
        return this.db('role_permissions')
            .join('roles', 'role_permissions.role_id', 'roles.id')
            .where('role_permissions.permission_id', permissionId)
            .select('roles.id', 'roles.name', 'roles.description');
    }

    /**
     * Retrieves all users that have a specific permission through their roles.
     * @param {number} permissionId - The permission's ID.
     * @returns {Array} - List of users.
     */
    async getUsers(permissionId) {
        return this.db('role_permissions')
            .join('user_roles', 'role_permissions.role_id', 'user_roles.role_id')
            .join('users', 'user_roles.user_id', 'users.id')
            .where('role_permissions.permission_id', permissionId)
            .distinct('users.id', 'users.username', 'users.email');
    }

    /**
     * Creates multiple permissions in a single transaction.
     * @param {Array<Object>} permissions - Array of permission objects.
     * @returns {Array} - The created permissions.
     */
    async createMany(permissions) {
        return this.transaction(async (trx) => {
            const createdPermissions = await trx(this.tableName)
                .insert(permissions)
                .returning('*');
            return createdPermissions;
        });
    }

    /**
     * Checks if a permission exists by name.
     * @param {string} permissionName - The permission's name.
     * @returns {boolean} - True if permission exists, false otherwise.
     */
    async exists(permissionName) {
        const result = await this.db(this.tableName)
            .where({ name: permissionName })
            .count('id as count')
            .first();
        return result.count > 0;
    }

    /**
     * Deletes a permission and all its role associations.
     * @param {number} permissionId - The permission's ID.
     * @returns {number} - Number of deleted records.
     */
    async deleteWithAssociations(permissionId) {
        return this.transaction(async (trx) => {
            // First delete role_permissions associations
            await trx('role_permissions')
                .where({ permission_id: permissionId })
                .del();
            
            // Then delete the permission itself
            return trx(this.tableName)
                .where({ id: permissionId })
                .del();
        });
    }

    /**
     * Groups permissions by category.
     * @returns {Object} - Permissions grouped by category.
     */
    async getGroupedByCategory() {
        const permissions = await this.db(this.tableName)
            .select('*')
            .orderBy('category', 'name');

        return permissions.reduce((groups, permission) => {
            const category = permission.category || 'uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(permission);
            return groups;
        }, {});
    }
}
