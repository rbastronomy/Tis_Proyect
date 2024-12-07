import { BaseModel } from '../core/BaseModel.js';

export class UserModel extends BaseModel {
  static defaultData = {
    rut: null,
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: null,
    correo: '',
    ntelefono: '',
    nacionalidad: '',
    genero: '',
    contrasena: '',
    estadop: 'ACTIVO',
    idroles: null,
    role: null,
    fcontratacion: null,
    licenciaconducir: null,
    adm_fcontratacion: null,
    cviajes: 0
  };

  constructor(data = {}) {
    super(data, UserModel.defaultData);
  }

  // Getters for common properties
  get rut() { return this._data.rut; }
  get nombre() { return this._data.nombre; }
  get apellido_paterno() { return this._data.apellido_paterno; }
  get apellido_materno() { return this._data.apellido_materno; }
  get fecha_nacimiento() { return this._data.fecha_nacimiento; }
  get correo() { return this._data.correo; }
  get telefono() { return this._data.telefono; }
  get nacionalidad() { return this._data.nacionalidad; }
  get genero() { return this._data.genero; }
  get estado_persona() { return this._data.estado_persona; }
  get role() { return this._data.role; }
  set role(value) { this._data.role = value; }
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

  isActive() {
    return this._data.estado_persona === 'ACTIVO';
  }

  hasPermission(permissionName) {
    return this._data.role?.hasPermission(permissionName) || false;
  }

  hasRole(roleName) {
    return this._data.role?.nombrerol === roleName;
  }

  toJSON() {
    return {
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
      role: this._data.role?.toJSON(),
      fecha_contratacion: this._data.fecha_contratacion,
      licencia_conducir: this._data.licencia_conducir,
      adm_fcontratacion: this._data.adm_fcontratacion,
      cviajes: this._data.cviajes
    };
  }

  toAuthAttributes() {
    return {
      rut: this._data.rut,
      nombre: this._data.nombre,
      correo: this._data.correo,
      idroles: this._data.idroles
    };
  }

  getRoleId() {
    return this._data.role?.idroles;
  }

  /**
   * Crea una instancia de UserModel desde datos de la base de datos
   * @param {Object} data - Datos crudos de la base de datos
   * @returns {UserModel}
   */

  static fromDB(data) {
    if (!data) return null;
    
    // Transformación específica para el modelo de Usuario
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
}
