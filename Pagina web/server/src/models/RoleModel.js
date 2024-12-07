import { BaseModel } from '../core/BaseModel.js';



export class RoleModel extends BaseModel {
  static defaultData = {
    id_roles: null,
    nombre_rol: '',
    descripcion_rol: '',
    fecha_creada_rol: new Date(),
    estado_rol: 'ACTIVO',
    permissions: []
  };

  constructor(data = {}) {
    const sanitizedData = {
      ...data,
      permissions: Array.isArray(data.permissions) ? data.permissions : []
    };
    super(sanitizedData, RoleModel.defaultData);
  }

  // Getters for common properties
  get idroles() { return this._data.idroles; }
  get nombre_rol() { return this._data.nombre_rol; }
  get descripcion_rol() { return this._data.descripcion_rol; }
  get fecha_creada_rol() { return this._data.fecha_creada_rol; }
  get estado_rol() { return this._data.estado_rol; }
  get permissions() { return this._data.permissions; }

  hasPermission(permissionName) {
    return this._data.permissions.some(p => 
      p.nombrepermiso === permissionName || p.name === permissionName
    );
  }

  getPermissions() {
    return this._data.permissions;
  }

  toJSON() {
    return {
      idroles: this._data.idroles,
      nombrerol: this._data.nombrerol,
      descripcionrol: this._data.descripcionrol,
      fechacreadarol: this._data.fechacreadarol,
      estadorol: this._data.estadorol,
      permissions: this._data.permissions.map(p => 
        p.nombrepermiso || p.name || p
      )
    };
  }

  /**
   * Creates a RoleModel instance from database data
   * @param {Object} data - Raw database data
   * @returns {RoleModel|null}
   */
  static fromDB(data) {
    if (!data) return null;
    return new RoleModel(data);
  }
}