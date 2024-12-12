import { BaseService } from '../core/BaseService.js';
import UserRepository from '../repository/UserRepository.js';
import { RoleService } from './RoleService.js';
import { UserModel } from '../models/UserModel.js';

export class UserService extends BaseService {
  constructor() {
    const userRepository = new UserRepository();
    super(userRepository);
    this.roleService = new RoleService();
  }

  /**
   * Gets user with auth details
   * @param {string} correo - User email
   * @returns {Promise<import('../models/UserModel.js').UserModel|null>} User with role and permissions
   */
  async getUserWithAuth(correo) {
    try {
      // Get base user data
      const UserData = await this.repository.findByEmail(correo);
      if (!UserData) return null;

      // Convert raw data to UserModel
      const user = UserModel.toModel(UserData);

      // Get user's role with permissions already loaded
      const role = await this.roleService.findById(UserData.id_roles);
      if (!role) {
        return null;
      }

      user.role = role;

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
    const userDB = await this.repository.create(userData);
    return UserModel.toModel(userDB);
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
    const userData = await this.repository.findByEmail(email);
    return UserModel.toModel(userData);
  }

  /**
   * Gets user by RUT
   * @param {string|number} rut - User RUT
   * @returns {Promise<import('../models/UserModel.js').UserModel|null>} User or null if not found
   */
  async getByRut(rut) {
    const userData = await this.repository.findByRut(rut);
    return UserModel.toModel(userData);
  }

  /**
   * Find all users with optional filters
   * @param {Object} [filters] - Optional filters to apply
   * @param {number} [filters.id_roles] - Filter by role ID
   * @param {string} [filters.estado_persona] - Filter by user status
   * @returns {Promise<UserModel[]>} Array of user models
   */
  async findAll(filters = {}) {
    try {
      const users = await this.repository.findAll(filters);
      console.log(users);
      return users.map(user => UserModel.toModel(user));
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }
}