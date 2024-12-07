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
   * @returns {Promise<UserModel|null>} User with role and permissions
   */
  async getUserWithAuth(correo) {
    try {
      // Get base user data
      const UserData = await this.repository.findByEmail(correo);
      if (!UserData) return null;

      // Get user's role with permissions already loaded
      const role = await this.roleService.findById(UserData.id_roles);
      if (!role) {
        return null;
      }

      //creamos el modelo de usuario
      const user = UserModel.toModel(UserData);

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