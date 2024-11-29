export class RoleModel {
  constructor({
    idroles = null,
    nombrerol = '',
    descripcionrol = '',
    fechacreadarol = new Date(),
    estadorol = 'ACTIVO',
    permissions = []
  } = {}) {
    this.idroles = idroles;
    this.nombrerol = nombrerol;
    this.descripcionrol = descripcionrol;
    this.fechacreadarol = fechacreadarol;
    this.estadorol = estadorol;
    this.permissions = permissions;
  }

  // Domain methods
  isActive() {
    return this.estadorol === 'ACTIVO';
  }

  hasPermission(permissionName) {
    return this.permissions.some(p => p.nombrepermiso === permissionName);
  }

  toJSON() {
    return {
      idroles: this.idroles,
      nombrerol: this.nombrerol,
      descripcionrol: this.descripcionrol,
      fechacreadarol: this.fechacreadarol,
      estadorol: this.estadorol,
      permissions: this.permissions
    };
  }

  static fromDB(data) {
    return new RoleModel(data);
  }
}