import { BaseRepository } from '../core/BaseRepository.js';
import { UserModel } from '../models/UserModel.js';
import { RoleModel } from '../models/RoleModel.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('persona');
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
        .join('roles', 'persona.idroles', 'roles.idroles')
        .where('rut', rut)
        .select(
          'persona.*',
          'roles.idroles',
          'roles.nombrerol',
          'roles.descripcionrol',
          'roles.fechacreadarol',
          'roles.estadorol'
        )
        .first();

      if (!user) return null;

      // Get role permissions
      const permissions = await this.db('posee')
        .join('permiso', 'posee.idpermisos', 'permiso.idpermisos')
        .where('posee.idroles', user.idroles)
        .select('permiso.*');

      // Create role instance with permissions
      const role = new RoleModel({
        idroles: user.idroles,
        nombrerol: user.nombrerol,
        descripcionrol: user.descripcionrol,
        fechacreadarol: user.fechacreadarol,
        estadorol: user.estadorol,
        permissions: permissions
      });

      // Remove role fields from user data
      delete user.idroles;
      delete user.nombrerol;
      delete user.descripcionrol;
      delete user.fechacreadarol;
      delete user.estadorol;

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
        .join('roles', 'persona.idroles', 'roles.idroles')
        .select(
          'persona.*',
          'roles.idroles',
          'roles.nombrerol',
          'roles.descripcionrol',
          'roles.fechacreadarol',
          'roles.estadorol'
        )
        .where(filters);

      // Load permissions for each user's role
      const usersWithRoles = await Promise.all(users.map(async (user) => {
        const permissions = await this.db('posee')
          .join('permiso', 'posee.idpermisos', 'permiso.idpermisos')
          .where('posee.idroles', user.idroles)
          .select('permiso.*');

        const role = new RoleModel({
          idroles: user.idroles,
          nombrerol: user.nombrerol,
          descripcionrol: user.descripcionrol,
          fechacreadarol: user.fechacreadarol,
          estadorol: user.estadorol,
          permissions: permissions
        });

        // Remove role fields from user data
        delete user.idroles;
        delete user.nombrerol;
        delete user.descripcionrol;
        delete user.fechacreadarol;
        delete user.estadorol;

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
      const user = await this.findByRut(id);
      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async update(rut, userData) {
    try {
      await super.update(rut, userData, 'rut');
      const user = await this.findByRut(rut);
      return user;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async getPermissions(rut) {
    try {
      const user = await this.findByRut(rut);
      return user?.role?.permissions || [];
    } catch (error) {
      throw new Error(`Error getting user permissions: ${error.message}`);
    }
  }
}

export default UserRepository;
