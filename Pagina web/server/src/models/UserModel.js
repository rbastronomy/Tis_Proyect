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
    updatedAt: null
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
<<<<<<< HEAD
  get apellido_paterno() { return this._data.apellido_paterno; }
  get apellido_materno() { return this._data.apellido_materno; }
  get fecha_nacimiento() { return this._data.fecha_nacimiento; }
  get correo() { return this._data.correo; }
  get telefono() { return this._data.telefono; }
=======
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
>>>>>>> c21906aabcf45981368753789d1ec19379cf086a
  get nacionalidad() { return this._data.nacionalidad; }
  /** @returns {string} User's gender */
  get genero() { return this._data.genero; }
<<<<<<< HEAD
  get estado_persona() { return this._data.estado_persona; }
=======
  /** @returns {string} User's account status */
  get estadoPersona() { return this._data.estado_persona; }
  /** @returns {import('./RoleModel.js').RoleModel} User's role */
>>>>>>> c21906aabcf45981368753789d1ec19379cf086a
  get role() { return this._data.role; }
  /** @param {import('./RoleModel.js').RoleModel} value - Role to assign to the user */
  set role(value) { this._data.role = value; }
<<<<<<< HEAD
  get fecha_contratacion() { return this._data.fecha_contratacion; }
  get licencia_conducir() { return this._data.licencia_conducir; }
  get adm_fcontratacion() { return this._data.adm_fcontratacion; }
  get cviajes() { return this._data.cviajes; }
  get idroles() { return this._data.idroles; }
  get contrasena() { return this._data.contrasena; }

  // Domain methods
  getNombreCompleto() {
    return `${this._data.nombre} ${this._data.apellido_paterno} ${this._data.apellido_materno}`;
  }

  isLicenciaVigente() {
    const today = new Date();
    const licenciaDate = new Date(this._data.licencia_conducir);
    return licenciaDate > today;
  }

  getAntiguedad() {
    const today = new Date();
    const contratacionDate = new Date(this._data.fecha_contratacion);
    const diffTime = Math.abs(today - contratacionDate);
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365)); 
    return diffYears;
  }
=======
  /** @returns {Date} User's hire date */
  get fechaContratacion() { return this._data.fecha_contratacion; }
  /** @returns {Date} User's driver's license expiration date */
  get licenciaConducir() { return this._data.licencia_conducir; }
>>>>>>> c21906aabcf45981368753789d1ec19379cf086a

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
      updatedAt: data.updatedAt
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
<<<<<<< HEAD
      role: this._data.role?.toJSON(),
      fecha_contratacion: this._data.fecha_contratacion,
      licencia_conducir: this._data.licencia_conducir,
      adm_fcontratacion: this._data.adm_fcontratacion,
      cviajes: this._data.cviajes
=======
      role: this._data.role,
      fecha_contratacion: this._data.fecha_contratacion,
      licencia_conducir: this._data.licencia_conducir,
      createdAt: this._data.createdAt,
      updatedAt: this._data.updatedAt
>>>>>>> c21906aabcf45981368753789d1ec19379cf086a
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
}


