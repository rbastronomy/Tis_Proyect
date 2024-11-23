import { BaseRepository } from '../core/BaseRepository.js';
import { UserModel } from '../models/UserModel.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('persona');
  }

  _toModel(data) {
    if (!data) return null;
    
    const modelData = {
      ...data,
      role: data.idroles ? {
        id: data.idroles,
        name: data.roleName
      } : null
    };

    delete modelData.idroles;
    
    return new UserModel(modelData);
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
        .join('roles', 'persona.idroles', 'roles.idroles')
        .where('rut', rut)
        .select(
          'persona.*',
          'roles.nombrerol as roleName'
        )
        .first();
      return this._toModel(user);
    } catch (error) {
      throw new Error(`Error finding user by RUT: ${error.message}`);
    }
  }

  async findAll(filters = {}, options = {}) {
    try {
      const users = await this.db(this.tableName)
        .join('roles', 'persona.idroles', 'roles.idroles')
        .select(
          'persona.*',
          'roles.nombrerol as roleName'
        )
        .where(filters);
      return users.map(user => this._toModel(user));
    } catch (error) {
      throw new Error(`Error finding all users: ${error.message}`);
    }
  }

  async create(userData) {
    try {
      const dbData = {
        ...userData,
        idroles: userData.role?.id
      };
      delete dbData.role;

      const [id] = await super.create(dbData);
      const user = await this.findByRut(id);
      return this._toModel(user);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async update(rut, userData) {
    try {
      await super.update(rut, userData, 'rut');
      const user = await this.findByRut(rut);
      return this._toModel(user);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async getPermissions(rut) {
    try {
      return await this.db('posee')
        .join('permiso', 'posee.idpermisos', 'permiso.idpermisos')
        .join('roles', 'posee.idroles', 'roles.idroles')
        .join('persona', 'persona.idroles', 'roles.idroles')
        .where('persona.rut', rut)
        .select('permiso.nombrepermiso');
    } catch (error) {
      throw new Error(`Error getting user permissions: ${error.message}`);
    }
  }
}

export default UserRepository;
