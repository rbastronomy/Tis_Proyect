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

  hasPermission(permissionName) {
    return this.permissions.some(p => p.nombrepermiso === permissionName);
  }

  getPermissions() {
    return this.permissions;
  }

  toJSON() {
    return {
      idroles: this.idroles,
      nombrerol: this.nombrerol,
      descripcionrol: this.descripcionrol,
      fechacreadarol: this.fechacreadarol,
      estadorol: this.estadorol,
      permissions: this.permissions.map(p => p.nombrepermiso)
    };
  }

  static fromDB(data) {
    return new RoleModel(data);
  }
}