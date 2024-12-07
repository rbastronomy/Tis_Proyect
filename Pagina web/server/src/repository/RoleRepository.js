import { BaseRepository } from '../core/BaseRepository.js';
import { RoleModel } from '../models/RoleModel.js';

export class RoleRepository extends BaseRepository {
  constructor() {
    super('roles', RoleModel, 'id_roles');
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
        .join('posee', 'permiso.id_permisos', 'posee.id_permisos')
        .where('posee.id_roles', roleId)
        .select('permiso.*');
      
      return this._toModel({
        ...role,
        permissions
      });
    } catch (error) {
      throw new Error(`Error finding role by ID: ${error.message}`);
    }
  }

  /**
   * Finds a role by its name
   * @param {string} name - Role name
   * @returns {Promise<RoleModel|null>} - The role model or null if not found
   */
  async findByName(name) {
    try {
      const role = await this.db(this.tableName)
        .where('nombre_rol', name)
        .first();
      return this._toModel(role);
    } catch (error) {
      throw new Error(`Error finding role by name: ${error.message}`);
    }
  }

  /**
   * Assigns a permission to a role
   * @param {number} roleId - Role ID
   * @param {number} permissionId - Permission ID
   * @returns {Promise<void>}
   */
  async assignPermission(roleId, permissionId) {
    try {
      await this.db('posee').insert({
        id_roles: roleId,
        id_permisos: permissionId,
        fecha_cambio_permiso: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      });
    } catch (error) {
      throw new Error(`Error assigning permission: ${error.message}`);
    }
  }

  /**
   * Removes a permission from a role
   * @param {number} roleId - Role ID
   * @param {number} permissionId - Permission ID
   * @returns {Promise<void>}
   */
  async removePermission(roleId, permissionId) {
    try {
      await this.db('posee')
        .where({
          id_roles: roleId,
          id_permisos: permissionId
        })
        .delete();
    } catch (error) {
      throw new Error(`Error removing permission: ${error.message}`);
    }
  }

  /**
   * Creates a new role with optional permissions
   * @param {Object} roleData - Role data
   * @returns {Promise<RoleModel>} Created role
   */
  async create(roleData) {
    try {
      const [roleId] = await this.db(this.tableName)
        .insert({
          ...roleData,
          fecha_creada_rol: new Date(),
          estado_rol: 'ACTIVO',
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('id_roles');

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

  /**
   * Updates a role
   * @param {number} roleId - Role ID
   * @param {Object} roleData - Updated role data
   * @returns {Promise<RoleModel|null>} Updated role or null
   */
  async update(roleId, roleData) {
    try {
      const [updated] = await this.db(this.tableName)
        .where('id_roles', roleId)
        .update({
          ...roleData,
          updated_at: new Date()
        })
        .returning('*');

      return updated ? this._toModel(updated) : null;
    } catch (error) {
      throw new Error(`Error updating role: ${error.message}`);
    }
  }

  /**
   * Soft deletes a role
   * @param {number} roleId - Role ID
   * @returns {Promise<RoleModel|null>} Deleted role or null
   */
  async softDelete(roleId) {
    try {
      const [deleted] = await this.db(this.tableName)
        .where('id_roles', roleId)
        .update({
          estado_rol: 'ELIMINADO',
          updated_at: new Date()
        })
        .returning('*');

      return deleted ? this._toModel(deleted) : null;
    } catch (error) {
      throw new Error(`Error soft deleting role: ${error.message}`);
    }
  }

  /**
   * Gets all roles with their permissions
   * @returns {Promise<RoleModel[]>} Array of roles with permissions
   */
  async findAllWithPermissions() {
    try {
      const roles = await this.db(this.tableName)
        .select('*')
        .where('estado_rol', 'ACTIVO');

      const rolesWithPermissions = await Promise.all(
        roles.map(async (role) => {
          const permissions = await this.db('permiso')
            .join('posee', 'permiso.id_permisos', 'posee.id_permisos')
            .where('posee.id_roles', role.id_roles)
            .select('permiso.*');

          return this._toModel({
            ...role,
            permissions
          });
        })
      );

      return rolesWithPermissions;
    } catch (error) {
      throw new Error(`Error finding roles with permissions: ${error.message}`);
    }
  }
}

export default RoleRepository; 