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
      idroles: this.idroles,
      nombrerol: this.nombrerol,
      descripcionro: this.descripcionrol,
      fechacreadarol: this.fechacreadarol,
      esadorol: this.estadorol
    };
  }

  static fromDB(data){
    return new RoleModel(data);
  }

}