import { BaseRepository } from '../core/BaseRepository.js';
import { RoleModel } from '../models/RoleModel.js';
import PermissionRepository from './PermissionRepository.js';

export class RoleRepository extends BaseRepository {
  constructor() {
    super('roles');
    this.permissionRepository = new PermissionRepository();
  }

  _toModel(data) {
    if (!data) return null;
    return new RoleModel(data);
  }

  async findById(roleId) {
    try {
      const role = await this.db(this.tableName)
        .where('idroles', roleId)
        .first();

      if (!role) return null;

      // Get permissions for this role
      const permissions = await this.getPermissions(roleId);
      
      return this._toModel({
        ...role,
        permissions
      });
    } catch (error) {
      throw new Error(`Error finding role by ID: ${error.message}`);
    }
  }

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
      const [roleId] = await super.create(roleData);
      
      // If permissions are provided, assign them
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

  async update(roleId, roleData) {
    try {
      await super.update(roleId, roleData);
      return this.findById(roleId);
    } catch (error) {
      throw new Error(`Error updating role: ${error.message}`);
    }
  }
} 