import { BaseRepository } from '../core/BaseRepository.js';
import { RoleModel } from '../models/RoleModel.js';

export class RoleRepository extends BaseRepository {
  constructor() {
    super('roles', RoleModel, 'idroles');
  }

  _toModel(data) {
    if (!data) return null;
    return new RoleModel(data);
  }

  /**
   * Finds a role by its ID
   * @param {string|number} roleId - The ID of the role
   * @returns {Promise<RoleModel|null>} - The role model or null if not found
   */
  async findById(roleId) {
    try {
      const role = await this.db(this.tableName)
        .where(this.primaryKey, roleId)
        .first();

      if (!role) return null;

      const permissions = await this.db('permiso')
        .join('posee', 'permiso.idpermisos', 'posee.idpermisos')
        .where('posee.idroles', roleId)
        .select('permiso.*');
      
      return this._toModel({
        ...role,
        permissions
      });
    } catch (error) {
      throw new Error(`Error finding role by ID: ${error.message}`);
    }
  }

  async findByName(name) {
    try {
      const role = await this.db(this.tableName)
        .where('nombrerol', name)
        .first();
      return this._toModel(role);
    } catch (error) {
      throw new Error(`Error finding role by name: ${error.message}`);
    }
  }

  async assignPermission(roleId, permissionId) {
    try {
      await this.db('posee').insert({
        idroles: roleId,
        idpermisos: permissionId,
        fcambio: new Date()
      });
    } catch (error) {
      throw new Error(`Error assigning permission: ${error.message}`);
    }
  }

  async removePermission(roleId, permissionId) {
    try {
      await this.db('posee')
        .where({
          idroles: roleId,
          idpermisos: permissionId
        })
        .delete();
    } catch (error) {
      throw new Error(`Error removing permission: ${error.message}`);
    }
  }

  async create(roleData) {
    try {
      const [roleId] = await this.db(this.tableName)
        .insert({
          ...roleData,
          fechacreadarol: new Date(),
          estadorol: 'ACTIVO'
        })
        .returning('idroles');

      if (roleData.permissions?.length) {
        await Promise.all(
          roleData.permissions.map(permissionId => 
            this.assignPermission(roleId, permissionId)
          )
        );
      }

      return this.findById(roleId);
    } catch (error) {
      throw new Error(`Error creating role: ${error.message}`);
    }
  }
} 