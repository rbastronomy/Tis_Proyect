import { BaseModel } from '../core/BaseModel.js';

export class UserModel extends BaseModel {
  constructor({
    rut,
    nombre,
    apellidop,
    apellidom,
    fnacimiento,
    correo,
    ntelefono,
    nacionalidad,
    genero,
    contrasena,
    estadop,
    role,
    fcontratacion,
    licenciaconducir,
    adm_fcontratacion,
    cviajes,
    permissions = []
  }) {
    super({
      rut,
      nombre,
      apellidop,
      apellidom,
      fnacimiento,
      correo,
      ntelefono,
      nacionalidad,
      genero,
      contrasena,
      estadop,
      role,
      fcontratacion,
      licenciaconducir,
      adm_fcontratacion,
      cviajes,
      permissions
    });
  }
  
 // Getters para propiedades comunes
 get rut() { return this._data.rut; }
 get nombre() { return this._data.nombre; }
 get apellidop() { return this._data.apellidop; }
 get apellidom() { return this._data.apellidom; }

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

  hasPermission(permission) {
    return this._data.permissions.includes(permission);
  }

  hasRole(roleName) {
    return this._data.role?.name === roleName;
  }

  // Method to convert model to JSON representation
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
      role: this._data.role,
      fcontratacion: this._data.fcontratacion,
      licenciaconducir: this._data.licenciaconducir,
      adm_fcontratacion: this._data.adm_fcontratacion,
      cviajes: this._data.cviajes
    };
  }

  // Method to convert model to auth attributes
  toAuthAttributes() {
    return {
      rut: this._data.rut,
      nombre: this._data.nombre,
      correo: this._data.correo,
      role: this._data.role?.id
    };
  }

  // New method to get role ID when needed
  getRoleId() {
    return this._data.role?.id;
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
