export class RoleModel{
  constructor({
    idroles,
    nombrerol,
    descripcionrol,
    fechacreadarol,
    estadorol
  }){
    this.idroles = idroles;
    this.nombrerol = nombrerol;
    this.descripcionrol = descripcionrol;
    this.fechacreadarol = fechacreadarol;
    this.estadorol = estadorol;
  }

  //Agregar metodos necesarios para el manejo de la clase

  toJSON(){
    return {
      codigor: this.codigor,
      descripcionr: this.descripcionr,
      deleter: this.deleter,
    };
  }

  static fromDB(data){
    return new RoleModel(data);
  }

}