import { BaseModel } from '../core/BaseModel.js';

export class TaxiModel extends BaseModel{

  static taxiData = {
    patente: null,
    rut: null,
    marco: '',
    modelo: '',
    color: '',
    ano: null,
    estado: '',
    revisiontecnica: null,
    permisoscirculacion: null,
    deletedatt: null,
    estadotx: 'DISPONIBLE'
  }
  
  constructor(data = {}){
    super(data, TaxiModel.taxiData);
  }

  get patente() { return this._data.patente; }
  get marco() { return this._data.marco; }
  get modelo() { return this._data.modelo; }
  get estadotx() { return this._data.estadotx; }

  isAvailable(){
    return this._data.estadotx === 'DISPONIBLE';
  }



  //Agregar metodos necesarios para el manejo de la clase

  toJSON(){
    return {
      patente: this._data.patente,
      marco: this._data.marco,
      modelo: this._data.modelo,
      color: this._data.color,
      ano: this._data.ano,
      estado: this._data.estado,
      revisiontecnica: this._data.revisiontecnica,
      permisoscirculacion: this._data.permisoscirculacion,
      deletedatt: this._data.deletedatt,
      estadotx: this._data.estadotx
    };
  }

  static fromDB(data){
    return new TaxiModel(data);
  }

}