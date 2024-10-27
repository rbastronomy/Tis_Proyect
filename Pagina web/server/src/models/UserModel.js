import { BaseModel } from '../core/BaseModel.js';

export class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  // Use inherited create method from BaseModel
  async create(data) {
    return super.create(data);
  }

  // Use inherited update method from BaseModel
  async update(id, data) {
    return super.update(id, data);
  }

  /**
   * Retrieves a user by username.
   * @param {string} username - The user's username.
   * @returns {Object|null} - The user object or null.
   */
  async getByUsername(username) {
    return this.db(this.tableName).where({ username }).first();
  }

  async createUser(data) {
    return this.db(this.tableName).insert(data).returning('*');
  }

  // Custom method for creating a user with a transaction
  async createWithTransaction(data) {
    return this.transaction(async (trx) => {
      const [user] = await trx(this.tableName).insert(data).returning('*');
      // Add more operations within the transaction if needed
      return user;
    });
  }

 
  /**
   * Retrieves roles associated with a user.
   * @param {number} userId - The user's ID.
   * @returns {Array} - List of roles.
   */
  async getRoles(userId) {
    return this.db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .select('roles.id', 'roles.name', 'roles.description');
  }

  async assignRole(userId, roleId) {
    return this.db('user_roles').insert({ user_id: userId, role_id: roleId });
  }

  async removeRole(userId, roleId) {
    return this.db('user_roles')
      .where({ user_id: userId, role_id: roleId })
      .del();
  }

 /**
   * Retrieves permissions associated with a user through roles.
   * @param {number} userId - The user's ID.
   * @returns {Array} - List of permissions.
   */
 async getPermissions(userId) {
  return this.db('user_roles')
    .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
    .join('permissions', 'role_permissions.permission_id', 'permissions.id')
    .where('user_roles.user_id', userId)
    .select('permissions.id', 'permissions.name', 'permissions.description');
}
}
