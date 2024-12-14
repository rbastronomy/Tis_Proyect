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
      if (!UserData || UserData.deleted_at_persona) return null;

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
      const usersData = await this.repository.findAll(filters);
      for (const user of usersData) {
        const role = await this.roleService.findById(user.id_roles);
        user.role = role;
      }
      return usersData.map(user => UserModel.toModel(user));
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }

  /**
   * Soft deletes a user by setting their estado_persona to 'ELIMINADO'
   * @param {string|number} rut - User RUT to delete
   * @returns {Promise<import('../models/UserModel.js').UserModel|null>} Deleted user or null
   */
  async softDelete(rut) {
    try {
      const result = await this.repository.softDelete(rut);
      if (!result) return null;
      return UserModel.toModel(result);
    } catch (error) {
      console.error('Error soft deleting user:', error);
      throw error;
    }
  }

  /**
   * Find one user with filters
   * @param {Object} filters - Filters to apply
   * @returns {Promise<UserModel|null>} User model or null
   */
  async findOne(filters) {
    try {
      const user = await this.repository.findOne(filters);
      return user ? UserModel.toModel(user) : null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  /**
   * Find a driver by their RUT with optional include options
   * @param {string|number} rut - The driver's RUT (can include verifier digit)
   * @param {Object} options - Additional query options (like include)
   * @returns {Promise<Object|null>} The driver object or null if not found
   */
  async findDriverByRut(rut, options = {}) {
    try {
      // Clean the format first
      const cleanRut = rut.toString().replace(/\./g, '').replace(/-/g, '');
      
      // Determine if the RUT includes verifier digit
      // Chilean RUT without verifier is typically 7-8 digits
      // With verifier it's 8-9 digits
      let searchRut;
      if (cleanRut.length > 8) { // Has verifier digit
        searchRut = parseInt(cleanRut.slice(0, -1));
        console.log('Searching with RUT (removed verifier):', searchRut);
      } else { // Already without verifier
        searchRut = parseInt(cleanRut);
        console.log('Searching with RUT (no verifier):', searchRut);
      }
      
      const driver = await this.repository.findOne({
        rut: searchRut,
        id_roles: 3,
        deleted_at_persona: null
      });

      if (!driver) {
        console.log('No driver found with RUT:', searchRut);
        return null;
      }

      console.log('Found driver:', driver);

      // Get role with permissions
      const role = await this.roleService.findById(driver.id_roles);
      driver.role = role;

      return UserModel.toModel(driver);
    } catch (error) {
      console.error('Error in findDriverByRut:', error);
      throw error;
    }
  }

  /**
   * Find drivers by their RUTs in bulk
   * @param {Array<number>} ruts - Array of driver RUTs
   * @param {Date} [bookingTime=new Date()] - The time of the booking
   * @returns {Promise<Object>} Map of RUT to driver models
   */
  async findDriversByRuts(ruts, bookingTime = new Date()) {
    try {
      return await this.repository.findDriversByRuts(ruts, bookingTime);
    } catch (error) {
      console.error('Error finding drivers by RUTs:', error);
      throw new Error('Failed to fetch drivers');
    }
  }
}