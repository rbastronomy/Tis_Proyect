import { BaseModel } from '../core/BaseModel.js';

/**
 * Represents a user data from the database
 * @typedef {Object} UserData
 * @property {number} rut - Chilean identification number (RUT)
 * @property {string} nombre - User's first name
 * @property {string} apellido_paterno - User's paternal surname
 * @property {string} apellido_materno - User's maternal surname
 * @property {Date} fecha_nacimiento - User's date of birth
 * @property {string} correo - User's email address
 * @property {string} telefono - User's phone number
 * @property {string} nacionalidad - User's nationality
 * @property {string} genero - User's gender
 * @property {string} contrasena - User's hashed password
 * @property {('ACTIVO'|'INACTIVO')} estado_persona - User's account status
 * @property {number} id_roles - Foreign key reference to roles table
 * @property {Date} fecha_contratacion - User's hire date
 * @property {Date} licencia_conducir - User's driver's license expiration date
 * @property {Date} createdAt - Timestamp of when the record was created
 * @property {Date} updatedAt - Timestamp of when the record was last updated
 */

/**
 * Represents the internal data structure of UserModel
 * @typedef {Object} UserModelData
 * @property {number|null} rut - Chilean identification number (RUT)
 * @property {string} nombre - User's first name
 * @property {string} apellido_paterno - User's paternal surname
 * @property {string} apellido_materno - User's maternal surname
 * @property {Date|null} fecha_nacimiento - User's date of birth
 * @property {string} correo - User's email address
 * @property {string} telefono - User's phone number
 * @property {string} nacionalidad - User's nationality
 * @property {string} genero - User's gender
 * @property {string} contrasena - User's hashed password
 * @property {('ACTIVO'|'INACTIVO')} estado_persona - User's account status
 * @property {RoleModel|null} role - User's role model instance
 * @property {Date|null} fecha_contratacion - User's hire date
 * @property {Date|null} licencia_conducir - User's driver's license expiration date
 * @property {Date|null} createdAt - Timestamp of when the record was created
 * @property {Date|null} updatedAt - Timestamp of when the record was last updated
 */

/**
 * @typedef {import('./UserModel.js').UserModel} UserModel
 */

/**
 * Class representing a User in the system
 * @extends {BaseModel<UserModelData>}
 */
export class UserModel extends BaseModel {
  /**
   * Default values for a new user instance
   * @type {UserModelData}
   */
  static defaultData = {
    rut: null,
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: null,
    correo: '',
    telefono: '',
    nacionalidad: '',
    genero: '',
    contrasena: '',
    estado_persona: 'ACTIVO',
    role: null,
    fecha_contratacion: null,
    licencia_conducir: null,
    createdAt: null,
    updatedAt: null,
    deletedAt: null
  };

  /**
   * Creates a new UserModel instance
   * @param {Partial<UserModelData>} data - Initial user data
   */
  constructor(data = {}) {
    super(data, UserModel.defaultData);
  }

  // Getters
  /** @returns {number} User's RUT number */
  get rut() { return this._data.rut; }
  /** @returns {string} User's first name */
  get nombre() { return this._data.nombre; }
  /** @returns {string} User's paternal surname */
  get apellidoPaterno() { return this._data.apellido_paterno; }
  /** @returns {string} User's maternal surname */
  get apellidoMaterno() { return this._data.apellido_materno; }
  /** @returns {Date} User's date of birth */
  get fechaNacimiento() { return this._data.fecha_nacimiento; }
  /** @returns {string} User's email address */
  get correo() { return this._data.correo; }
  /** @returns {string} User's phone number */
  get telefono() { return this._data.telefono; }
  /** @returns {string} User's nationality */
  get nacionalidad() { return this._data.nacionalidad; }
  /** @returns {string} User's gender */
  get genero() { return this._data.genero; }
  /** @returns {string} User's account status */
  get estadoPersona() { return this._data.estado_persona; }
  /** @returns {import('./RoleModel.js').RoleModel} User's role */
  get role() { return this._data.role; }
  /** @param {import('./RoleModel.js').RoleModel} value - Role to assign to the user */
  set role(value) { this._data.role = value; }
  /** @returns {Date} User's hire date */
  get fechaContratacion() { return this._data.fecha_contratacion; }
  /** @returns {Date} User's driver's license expiration date */
  get licenciaConducir() { return this._data.licencia_conducir; }

  /**
   * Checks if the user account is active
   * @returns {boolean} True if the user is active
   */
  isActive() {
    return this._data.estado_persona === 'ACTIVO';
  }

  /**
   * Checks if the user has a specific role
   * @param {number} roleId - The role ID to check
   * @returns {boolean} True if the user has the specified role
   */
  hasRole(roleId) {
    return this._data.role?.id === roleId;
  }

  /**
   * Checks if the user is a driver
   * @returns {boolean} True if the user has a driver role and license
   */
  isDriver() {
    return this.hasRole(3) && this._data.licencia_conducir !== null;
  }

  /**
   * Checks if the user has a valid driver's license
   * @returns {boolean} True if the license is valid and not expired
   */
  hasValidLicense() {
    if (!this._data.licencia_conducir) return false;
    const today = new Date();
    return new Date(this._data.licencia_conducir) > today;
  }

  /**
   * Gets the user's full name
   * @returns {string} The concatenated full name
   */
  getFullName() {
    return `${this._data.nombre} ${this._data.apellido_paterno} ${this._data.apellido_materno}`.trim();
  }

  /**
   * Creates a UserModel instance from a database entity
   * @param {UserEntity} entity - Database entity object
   * @returns {UserModel|null} A new UserModel instance or null if entity is invalid
   */
  static toModel(data) {
    if (!data) return null;
    
    return new UserModel({
      rut: data.rut,
      nombre: data.nombre,
      apellido_paterno: data.apellido_paterno,
      apellido_materno: data.apellido_materno,
      fecha_nacimiento: data.fecha_nacimiento,
      correo: data.correo,
      telefono: data.telefono,
      nacionalidad: data.nacionalidad,
      genero: data.genero,
      contrasena: data.contrasena,
      estado_persona: data.estado_persona,
      role: null,
      fecha_contratacion: data.fecha_contratacion,
      licencia_conducir: data.licencia_conducir,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt
    });
  }

  /**
   * Converts the user model to a JSON object, excluding sensitive data
   * @returns {Omit<UserEntity, 'contrasena'|'id_roles'> & { role?: RoleModel }} User data without password
   */
  toJSON() {
    const json = {
      rut: this._data.rut,
      nombre: this._data.nombre,
      apellido_paterno: this._data.apellido_paterno,
      apellido_materno: this._data.apellido_materno,
      fecha_nacimiento: this._data.fecha_nacimiento,
      correo: this._data.correo,
      telefono: this._data.telefono,
      nacionalidad: this._data.nacionalidad,
      genero: this._data.genero,
      estado_persona: this._data.estado_persona,
      role: this._data.role,
      fecha_contratacion: this._data.fecha_contratacion,
      licencia_conducir: this._data.licencia_conducir,
      createdAt: this._data.createdAt,
      updatedAt: this._data.updatedAt,
      deletedAt: this._data.deletedAt
    };

    return json;
  }

  toAuthAttributes() {
    return {
      rut: this._data.rut,
      nombre: this._data.nombre,
      correo: this._data.correo,
      role: this._data.role
    };
  }

  getRoleId() {
    return this._data.role?.id;
  }

  /**
   * Checks if the user has all the specified permissions
   * @param {string[]} requiredPermissions - Array of required permissions (names)
   * @returns {boolean} - True if user has all required permissions, false otherwise
   */
  hasPermissions(requiredPermissions) {
    if (!this.role || !this.role.permissions) return false;

    return requiredPermissions.every(requiredPermission =>
      this.role.permissions.some(
        permission => permission.nombre === requiredPermission
      )
    );
  }

  /**
   * Checks if the user has at least one of the specified roles
   * @param {string[]} requiredRoles - Array of required roles (names)
   * @returns {boolean} - True if user has at least one of the required roles, false otherwise
   */
  hasRoles(requiredRoles) {
    if (!this.role) return false;
    return requiredRoles.some(requiredRole => this.role.nombre === requiredRole);
  }
}


