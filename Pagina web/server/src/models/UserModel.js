export class UserModel {
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
    this.rut = rut;
    this.nombre = nombre;
    this.apellidop = apellidop;
    this.apellidom = apellidom;
    this.fnacimiento = fnacimiento;
    this.correo = correo;
    this.ntelefono = ntelefono;
    this.nacionalidad = nacionalidad;
    this.genero = genero;
    this.contrasena = contrasena;
    this.estadop = estadop;
    this.role = role;
    this.fcontratacion = fcontratacion;
    this.licenciaconducir = licenciaconducir;
    this.adm_fcontratacion = adm_fcontratacion;
    this.cviajes = cviajes;
    this.permissions = permissions;
  }

  // Domain methods
  getNombreCompleto() {
    return `${this.nombre} ${this.apellidop} ${this.apellidom}`;
  }

  isLicenciaVigente() {
    const today = new Date();
    const licenciaDate = new Date(this.licenciaconducir);
    return licenciaDate > today;
  }

  getAntiguedad() {
    const today = new Date();
    const contratacionDate = new Date(this.fcontratacion);
    const diffTime = Math.abs(today - contratacionDate);
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365)); 
    return diffYears;
  }

  isActive() {
    return this.estadop === 'ACTIVO';
  }

  hasPermission(permission) {
    return this.permissions.includes(permission);
  }

  hasRole(roleName) {
    return this.role?.name === roleName;
  }

  // Method to convert model to JSON representation
  toJSON() {
    return {
      rut: this.rut,
      nombre: this.nombre,
      apellidop: this.apellidop,
      apellidom: this.apellidom,
      fnacimiento: this.fnacimiento,
      correo: this.correo,
      ntelefono: this.ntelefono,
      nacionalidad: this.nacionalidad,
      genero: this.genero,
      estadop: this.estadop,
      role: this.role,
      fcontratacion: this.fcontratacion,
      licenciaconducir: this.licenciaconducir,
      adm_fcontratacion: this.adm_fcontratacion,
      cviajes: this.cviajes
    };
  }

  // Static method to create a User instance from database data
  static fromDB(data) {
    return new UserModel(data);
  }

  // Method to convert model to auth attributes
  toAuthAttributes() {
    return {
      rut: this.rut,
      nombre: this.nombre,
      correo: this.correo,
      role: this.role?.id
    };
  }

  // New method to get role ID when needed
  getRoleId() {
    return this.role?.id;
  }
}
