import { BaseService } from '../core/BaseService.js';
import UserRepository from '../repository/UserRepository.js';
import { RoleService } from './RoleService.js';
import { PermissionService } from './PermissionService.js';
import { RoleModel } from '../models/RoleModel.js';

export class UserService extends BaseService {
  constructor() {
    const userRepository = new UserRepository();
    super(userRepository);
    this.roleService = new RoleService();
    this.permissionService = new PermissionService();
  }

  /**
   * Gets user with auth details
   * @param {string} email - User email
   * @returns {Promise<UserModel|null>} User with role and permissions
   */
  async getUserWithAuth(email) {
    try {
      // Get base user data
      const user = await this.repository.findByEmail(email);
      if (!user) return null;

      // Get user's role with permissions already loaded
      const role = await this.roleService.findById(user.idroles);
      if (!role) {
        user.role = null;
        user.permissions = [];
        return user;
      }

      // Create a proper RoleModel instance
      const roleModel = new RoleModel({
        idroles: role.idroles,
        nombrerol: role.nombrerol,
        descripcionrol: role.descripcionrol,
        permissions: role.permissions
      });

      // Attach role model to user
      user.role = roleModel;

      // For backwards compatibility, also attach flat permissions array
      user.permissions = role.permissions.map(p => p.nombrepermiso);

      return user;
    } catch (error) {
      console.error('Error getting user with auth details:', error);
      throw error;
    }
  }

  /**
   * Creates a new user
   * @param {Object} userData - User data with hashed password
   * @returns {Promise<UserModel>} Created user
   */
  async create(userData) {
    return this.repository.create(userData);
  }

  /**
   * Updates user data
   * @param {string} rut - User RUT
   * @param {Object} userData - Updated user data
   */
  async update(rut, userData) {
    return this.repository.update(rut, userData);
  }

  async getByEmail(email) {
    return this.repository.findByEmail(email);
  }
}