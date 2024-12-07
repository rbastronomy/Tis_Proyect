import { BaseModel } from '../core/BaseModel.js';

/**
 * Represents role data from the database
 * @typedef {Object} RoleData
 * @property {number} id_roles - Unique identifier for the role
 * @property {string} nombre_rol - Name of the role
 * @property {string} descripcion_rol - Description of the role
 * @property {Date} fecha_creada_rol - Date when the role was created
 * @property {('ACTIVO'|'INACTIVO')} estado_rol - Status of the role
 * @property {Date} created_at - Timestamp of when the record was created
 * @property {Date} updated_at - Timestamp of when the record was last updated
 */

/**
 * Represents the internal data structure of RoleModel
 * @typedef {Object} RoleModelData
 * @property {number|null} id_roles - Unique identifier for the role
 * @property {string} nombre_rol - Name of the role
 * @property {string} descripcion_rol - Description of the role
 * @property {Date} fecha_creada_rol - Date when the role was created
 * @property {('ACTIVO'|'INACTIVO')} estado_rol - Status of the role
 * @property {Array<import('./PermissionModel.js').PermissionModel>} permissions - Array of associated permissions
 * @property {Date|null} created_at - Timestamp of when the record was created
 * @property {Date|null} updated_at - Timestamp of when the record was last updated
 */

/**
 * Class representing a Role in the system
 * @extends {BaseModel<RoleModelData>}
 */
export class RoleModel extends BaseModel {
  /**
   * Default values for a new role instance
   * @type {RoleModelData}
   */
  static defaultData = {
    id_roles: null,
    nombre_rol: '',
    descripcion_rol: '',
    fecha_creada_rol: new Date(),
    estado_rol: 'ACTIVO',
    permissions: [],
    created_at: null,
    updated_at: null
  };

  /**
   * Creates a new RoleModel instance
   * @param {Partial<RoleModelData>} data - Initial role data
   */
  constructor(data = {}) {
    const sanitizedData = {
      ...data,
      permissions: Array.isArray(data.permissions) ? data.permissions : []
    };
    super(sanitizedData, RoleModel.defaultData);
  }

  // Getters
  /** @returns {number|null} Role's ID */
  get id() { return this._data.id_roles; }
  /** @returns {string} Role's name */
  get nombre() { return this._data.nombre_rol; }
  /** @returns {string} Role's description */
  get descripcion() { return this._data.descripcion_rol; }
  /** @returns {Date} Role's creation date */
  get fechaCreada() { return this._data.fecha_creada_rol; }
  /** @returns {string} Role's status */
  get estado() { return this._data.estado_rol; }
  /** @returns {Array<import('./PermissionModel.js').PermissionModel>} Role's permissions */
  get permissions() { return this._data.permissions; }

  // Setters
  set permissions(permissions) { this._data.permissions = permissions; }

  /**
   * Checks if the role has a specific permission
   * @param {string} permissionName - Name of the permission to check
   * @returns {boolean} True if the role has the specified permission
   */
  hasPermission(permissionName) {
    return this._data.permissions.some(p => 
      p.nombrepermiso === permissionName || p.name === permissionName
    );
  }

  /**
   * Gets all permissions associated with this role
   * @returns {Array<import('./PermissionModel.js').PermissionModel>} Array of permissions
   */
  getPermissions() {
    return this._data.permissions;
  }

  /**
   * Checks if the role is active
   * @returns {boolean} True if the role is active
   */
  isActive() {
    return this._data.estado_rol === 'ACTIVO';
  }

  /**
   * Converts the role model to a JSON object
   * @returns {Object} Role data in JSON format
   */
  toJSON() {
    return {
      id_roles: this._data.id_roles,
      nombre_rol: this._data.nombre_rol,
      descripcion_rol: this._data.descripcion_rol,
      fecha_creada_rol: this._data.fecha_creada_rol,
      estado_rol: this._data.estado_rol,
      permissions: this._data.permissions.map(p => 
        typeof p === 'object' ? p.toJSON() : p
      ),
      created_at: this._data.created_at,
      updated_at: this._data.updated_at
    };
  }
}