import { BaseModel } from '../core/BaseModel.js';

export class TaxiModel extends BaseModel{

  static taxiData = {
    patente: null,
    rut_conductor: null,
    marca: '',
    modelo: '',
    color: '',
    ano: null,
    estado: '',
    vencimiento_revision_tecnica: null,
    vencimiento_permiso_circulacion: null,
    deleted_at_taxi: null,
    estado_taxi: 'DISPONIBLE',
    codigo_taxi: null,
  }
  
  constructor(data = {}){
    super(data, TaxiModel.taxiData);
  }

  get patente() { return this._data.patente; }
  get marca() { return this._data.marca; }
  get modelo() { return this._data.modelo; }
  get estado_taxi() { return this._data.estado_taxi; }

  isAvailable(){
    return this._data.estadotx === 'DISPONIBLE';
  }



  //Agregar metodos necesarios para el manejo de la clase

  toJSON(){
    return {
      patente: this._data.patente,
      marca: this._data.marca,
      modelo: this._data.modelo,
      color: this._data.color,
      ano: this._data.ano,
      estado: this._data.estado,
      vencimiento_revision_tecnica: this._data.vencimiento_revision_tecnica,
      vencimiento_permiso_circulacion: this._data.vencimiento_permiso_circulacion,
      deleted_at_taxi: this._data.deleted_at_taxi,
      estado_taxi: this._data.estado_taxi
    };
  }

  static fromDB(data){
    return new TaxiModel(data);
  }

}