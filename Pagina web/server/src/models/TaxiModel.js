export class TaxiModel{
  constructor({
    patente,
    marco,
    modelo,
    color,
    ano,
    estado,
    revisiontecnica,
    permisoscirculacion,
    deletedatt,
  }){
    this.patente = patente;
    this.marco = marco;
    this.modelo = modelo;
    this.color = color;
    this.ano = ano;
    this.estado = estado;
    this.revisiontecnica = revisiontecnica;
    this.permisoscirculacion = permisoscirculacion;
    this.deletedatt = deletedatt;
  }

  //Agregar metodos necesarios para el manejo de la clase

  toJSON(){
    return {
      patente: this.patente,
      marco: this.marco,
      modelo: this.modelo,
      color: this.color,
      ano: this.ano,
      estado: this.estado,
      revisiontecnica: this.revisiontecnica,
      permisoscirculacion: this.permisoscirculacion,
      deletedatt: this.deletedatt,
    };
  }

  static fromDB(data){
    return new TaxiModel(data);
  }

}