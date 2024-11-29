import { BaseModel } from '../core/BaseModel.js';

export class UserModel extends BaseModel {
  static defaultData = {
    rut: null,
    nombre: '',
    apellidop: '',
    apellidom: '',
    fnacimiento: null,
    correo: '',
    ntelefono: '',
    nacionalidad: '',
    genero: '',
    contrasena: '',
    estadop: 'ACTIVO',
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
  get apellidop() { return this._data.apellidop; }
  get apellidom() { return this._data.apellidom; }
  get fnacimiento() { return this._data.fnacimiento; }
  get correo() { return this._data.correo; }
  get ntelefono() { return this._data.ntelefono; }
  get nacionalidad() { return this._data.nacionalidad; }
  get genero() { return this._data.genero; }
  get estadop() { return this._data.estadop; }
  get role() { return this._data.role; }
  get fcontratacion() { return this._data.fcontratacion; }
  get licenciaconducir() { return this._data.licenciaconducir; }
  get adm_fcontratacion() { return this._data.adm_fcontratacion; }
  get cviajes() { return this._data.cviajes; }

  // Domain methods
  getNombreCompleto() {
    return `${this._data.nombre} ${this._data.apellidop} ${this._data.apellidom}`;
  }

  isLicenciaVigente() {
    const today = new Date();
    const licenciaDate = new Date(this._data.licenciaconducir);
    return licenciaDate > today;
  }

  getAntiguedad() {
    const today = new Date();
    const contratacionDate = new Date(this._data.fcontratacion);
    const diffTime = Math.abs(today - contratacionDate);
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365)); 
    return diffYears;
  }

  isActive() {
    return this._data.estadop === 'ACTIVO';
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
      apellidop: this._data.apellidop,
      apellidom: this._data.apellidom,
      fnacimiento: this._data.fnacimiento,
      correo: this._data.correo,
      ntelefono: this._data.ntelefono,
      nacionalidad: this._data.nacionalidad,
      genero: this._data.genero,
      estadop: this._data.estadop,
      role: this._data.role?.toJSON(),
      fcontratacion: this._data.fcontratacion,
      licenciaconducir: this._data.licenciaconducir,
      adm_fcontratacion: this._data.adm_fcontratacion,
      cviajes: this._data.cviajes
    };
  }

  toAuthAttributes() {
    return {
      rut: this._data.rut,
      nombre: this._data.nombre,
      correo: this._data.correo,
      role: this._data.role?.idroles
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
