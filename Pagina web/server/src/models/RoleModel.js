import { BaseModel } from '../core/BaseModel.js';

export class RoleModel extends BaseModel {
    constructor() {
        super('roles');
    }

    /**
   * Retrieves permissions associated with a role.
   * @param {number} roleId - The role's ID.
   * @returns {Array} - List of permissions.
   */
    async getPermissions(roleId) {
        return this.db('role_permissions')
            .join('permissions', 'role_permissions.permission_id', 'permissions.id')
            .where('role_permissions.role_id', roleId)
            .select('permissions.id', 'permissions.name', 'permissions.description');
    }

    async assignPermission(roleId, permissionId) {
        return this.db('role_permissions').insert({ role_id: roleId, permission_id: permissionId });
    }

    async removePermission(roleId, permissionId) {
        return this.db('role_permissions')
            .where({ role_id: roleId, permission_id: permissionId })
            .del();
    }

      /**
   * Retrieves a role by its name.
   * @param {string} roleName - The role's name.
   * @returns {Object|null} - The role object or null.
   */
    async getByName(roleName) {
        return this.db(this.tableName)
            .where({ name: roleName })
            .first();
    }
}
