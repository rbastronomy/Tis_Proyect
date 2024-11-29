import { BaseRepository } from '../core/BaseRepository.js';
import { RoleModel } from '../models/RoleModel.js';

export default class RoleRepository extends BaseRepository {
  constructor() {
    super('roles');
  }

  _toModel(data) {
    if (!data) return null;
    return new RoleModel(data);
  }

  /**
   * Find role by name
   * @param {string} name - Role name
   * @returns {Promise<RoleModel|null>}
   */
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

  /**
   * Get permissions for a role
   * @param {string} roleId - Role ID
   * @returns {Promise<Array>}
   */
  async getPermissions(roleId) {
    try {
      return await this.db('posee')
        .join('permiso', 'posee.idpermisos', 'permiso.idpermisos')
        .where('posee.idroles', roleId)
        .select('permiso.*');
    } catch (error) {
      throw new Error(`Error getting role permissions: ${error.message}`);
    }
  }

  /**
   * Assign permission to role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<void>}
   */
  async assignPermission(roleId, permissionId) {
    try {
      await this.db('posee').insert({
        idroles: roleId,
        idpermisos: permissionId
      });
    } catch (error) {
      throw new Error(`Error assigning permission: ${error.message}`);
    }
  }

  /**
   * Remove permission from role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<void>}
   */
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

  /**
   * Create new role
   * @param {Object} roleData - Role data
   * @returns {Promise<RoleModel>}
   */
  async create(roleData) {
    try {
      const [id] = await super.create(roleData);
      const role = await this.findById(id);
      return this._toModel(role);
    } catch (error) {
      throw new Error(`Error creating role: ${error.message}`);
    }
  }
}