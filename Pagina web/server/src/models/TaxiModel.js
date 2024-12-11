import { BaseModel } from '../core/BaseModel.js';
import { GeolocalizationModel } from './GeolocalizationModel.js';
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
    codigo_taxi: null,
    deleted_at_taxi: null,
    estado_taxi: 'DISPONIBLE',
    geolocalizacion: null
  }
  
  constructor(data = {}){
    super(data, TaxiModel.taxiData);
    this._data.geolocalizacion = new GeolocalizationModel(data.geolocalizacion);
  }

  get patente() { return this._data.patente; }
  get marca() { return this._data.marca; }
  get modelo() { return this._data.modelo; }
  get codigo_taxi() { return this._data.codigo_taxi; }
  get vencimiento_revision_tecnica() { return this._data.vencimiento_revision_tecnica; }
  get vencimiento_permiso_circulacion() { return this._data.vencimiento_permiso_circulacion; }
  get estado_taxi() { return this._data.estado_taxi; }

  isAvailable(){
    return this._data.estado_taxi === 'DISPONIBLE';
  }

  

  toJSON(){
    return {
      patente: this._data.patente,
      marca: this._data.marca,
      modelo: this._data.modelo,
      color: this._data.color,
      ano: this._data.ano,
      estado: this._data.estado,
      codigo_taxi: this._data.codigo_taxi,
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