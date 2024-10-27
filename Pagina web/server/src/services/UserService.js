import { BaseService } from '../core/BaseService.js';
import { UserModel } from '../models/UserModel.js';
import { RoleService } from './RoleService.js';

export class UserService extends BaseService {
  constructor() {
    const userModel = new UserModel();
    super(userModel);
    this.roleService = new RoleService();
  }

  //nethod to validate user credentials
  async validateUserCredentials(username, password) {
    const user = await this.model.getByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async getByUsername(username) {
    return this.model.getByUsername(username);
  }

  async createWithTransaction(data) {
    return this.model.createWithTransaction(data);
  }

  async getRoles(userId) {
    return this.model.getRoles(userId);
  }

  async assignRole(userId, roleId) {
    return this.model.assignRole(userId, roleId);
  }

  async removeRole(userId, roleId) {
    return this.model.removeRole(userId, roleId);
  }

  async getPermissions(userId) {
    return this.model.getPermissions(userId);
  }

  /**
   * Retrieves a role by its name.
   * @param {string} roleName - The role's name.
   * @returns {Object} - The role object.
   */
  async getRoleByName(roleName) {
    return this.roleService.model.getByName(roleName);
  }

  /**
   * Assigns default roles or permissions if needed.
   * @param {number} userId - The user's ID.
   * @param {Array} roles - List of roles to assign.
   */
  async assignDefaultRoles(userId, roles = ['user']) {
    for (const roleName of roles) {
      const role = await this.getRoleByName(roleName);
      if (role) {
        await this.assignRole(userId, role.id);
      }
    }
  }
}
