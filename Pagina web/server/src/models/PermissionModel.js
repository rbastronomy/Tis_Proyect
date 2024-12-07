import { BaseModel } from '../core/BaseModel.js';

/**
 * Represents permission data from the database
 * @typedef {Object} PermissionData
 * @property {number} id_permisos - Unique identifier for the permission
 * @property {string} nombre_permiso - Name of the permission
 * @property {string} descripcion_permiso - Description of the permission
 * @property {Date} fecha_creacion - Date when the permission was created
 * @property {Date} created_at - Timestamp of when the record was created
 * @property {Date} updated_at - Timestamp of when the record was last updated
 */

/**
 * Represents the internal data structure of PermissionModel
 * @typedef {Object} PermissionModelData
 * @property {number|null} id_permisos - Unique identifier for the permission
 * @property {string} nombre_permiso - Name of the permission
 * @property {string} descripcion_permiso - Description of the permission
 * @property {Date} fecha_creacion - Date when the permission was created
 * @property {Date|null} created_at - Timestamp of when the record was created
 * @property {Date|null} updated_at - Timestamp of when the record was last updated
 */

/**
 * Class representing a Permission in the system
 * @extends {BaseModel<PermissionModelData>}
 */
export class PermissionModel extends BaseModel {
  /**
   * Default values for a new permission instance
   * @type {PermissionModelData}
   */
  static defaultData = {
    id_permisos: null,
    nombre_permiso: '',
    descripcion_permiso: '',
    fecha_creacion: new Date(),
    created_at: null,
    updated_at: null
  };

  /**
   * Creates a new PermissionModel instance
   * @param {Partial<PermissionModelData>} data - Initial permission data
   */
  constructor(data = {}) {
    super(data, PermissionModel.defaultData);
  }

  // Getters
  /** @returns {number|null} Permission's ID */
  get id() { return this._data.id_permisos; }
  /** @returns {string} Permission's name */
  get nombre() { return this._data.nombre_permiso; }
  /** @returns {string} Permission's description */
  get descripcion() { return this._data.descripcion_permiso; }
  /** @returns {Date} Permission's creation date */
  get fechaCreacion() { return this._data.fecha_creacion; }
  /** @returns {Date|null} Permission's created at timestamp */
  get createdAt() { return this._data.created_at; }
  /** @returns {Date|null} Permission's updated at timestamp */
  get updatedAt() { return this._data.updated_at; }

  /**
   * Converts the permission model to a JSON object
   * @returns {Object} Permission data in JSON format
   */
  toJSON() {
    return {
      id_permisos: this._data.id_permisos,
      nombre_permiso: this._data.nombre_permiso,
      descripcion_permiso: this._data.descripcion_permiso,
      fecha_creacion: this._data.fecha_creacion,
      created_at: this._data.created_at,
      updated_at: this._data.updated_at
    };
  }
}