import { BaseService } from '../core/BaseService.js';
import UserRepository from '../repository/UserRepository.js';

export class UserService extends BaseService {
  constructor() {
    const userRepository = new UserRepository();
    super(userRepository);
  }

  /**
   * Gets user with auth details
   * @param {string} rut - User RUT
   */
  async getUserWithAuth(rut) {
    const user = await this.repository.findByRut(rut);
    if (!user) return null;

    const roles = await this.repository.getRoles(rut);
    const permissions = await this.repository.getPermissions(rut);
    
    user.role = roles[0]?.nombrerol;
    user.permissions = permissions.map(p => p.nombrepermiso);
    
    return user;
  }

  /**
   * Creates a new user
   * @param {Object} userData - User data
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