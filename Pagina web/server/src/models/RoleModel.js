import { BaseModel } from '../core/BaseModel.js';

export class RoleModel extends BaseModel {
  static defaultData = {
    idroles: null,
    nombrerol: '',
    descripcionrol: '',
    fechacreadarol: new Date(),
    estadorol: 'ACTIVO',
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
  get nombrerol() { return this._data.nombrerol; }
  get descripcionrol() { return this._data.descripcionrol; }
  get fechacreadarol() { return this._data.fechacreadarol; }
  get estadorol() { return this._data.estadorol; }
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