import { BaseRepository } from '../core/BaseRepository.js';
import { UserModel } from '../models/UserModel.js';
import { RoleRepository } from './RoleRepository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('persona', UserModel);
    this.roleRepository = new RoleRepository();
  }

  _toModel(data) {
    if (!data) return null;
    
    return new UserModel(data);
  }

  async findByEmail(email) {
    try {
      const user = await this.db(this.tableName)
        .where('correo', email)
        .first();
      return this._toModel(user);
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  async findByRut(rut) {
    try {
      const user = await this.db(this.tableName)
        .where('rut', rut)
        .first();

      if (!user) return null;

      // Get role through RoleRepository
      const role = await this.roleRepository.findById(user.idroles);
      
      // Create user model with role
      return this._toModel({
        ...user,
        role
      });
    } catch (error) {
      throw new Error(`Error finding user by RUT: ${error.message}`);
    }
  }

  async findAll(filters = {}) {
    try {
      const users = await this.db(this.tableName)
        .where(filters);

      // Load roles for each user
      const usersWithRoles = await Promise.all(users.map(async (user) => {
        const role = await this.roleRepository.findById(user.idroles);
        return {
          ...user,
          role
        };
      }));

      return usersWithRoles.map(user => this._toModel(user));
    } catch (error) {
      throw new Error(`Error finding all users: ${error.message}`);
    }
  }

  async create(userData) {
    try {
      const dbData = {
        ...userData,
        idroles: userData.role?.idroles
      };
      delete dbData.role;

      const [id] = await super.create(dbData);
      return this.findByRut(id);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async update(rut, userData) {
    try {
      await super.update(rut, userData, 'rut');
      return this.findByRut(rut);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }
}

export default UserRepository;
