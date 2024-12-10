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
    codigo_taxi: null,
    deleted_at_taxi: null,
    estado_taxi: 'DISPONIBLE'
  }
  
  constructor(data = {}){
    super(data, TaxiModel.taxiData);
  }

  get patente() { return this._data.patente; }
  set patente(value) { this._data.patente = value; }

  get marca() { return this._data.marca; }
  set marca(value) { this._data.marca = value; }

  get modelo() { return this._data.modelo; }
  set modelo(value) { this._data.modelo = value; }

  get codigo_taxi() { return this._data.codigo_taxi; }
  set codigo_taxi(value) { this._data.codigo_taxi = value; }
  
  get vencimiento_revision_tecnica() { return this._data.vencimiento_revision_tecnica; }
  set vencimiento_revision_tecnica(value) { this._data.vencimiento_revision_tecnica = value; }
  
  get vencimiento_permiso_circulacion() { return this._data.vencimiento_permiso_circulacion; }
  set vencimiento_permiso_circulacion(value) { this._data.vencimiento_permiso_circulacion = value; }
  
  get estado_taxi() { return this._data.estado_taxi; }
  set estado_taxi(value) { this._data.estado_taxi = value; }

  isAvailable(){
    return this._data.estado_taxi === 'DISPONIBLE';
  }

  isFueraDeServicio(){
    return this._data.estado_taxi === 'FUERA DE SERVICIO';
  }

  isEnServicio(){
    return this._data.estado_taxi === 'EN SERVICIO';
  }

  isMantenimiento(){
    return this._data.estado_taxi === 'MANTENIMIENTO';
  }

  static toModel(data){
    if(!data) return null;

    return new TaxiModel({
      patente: data.patente,
      marca: data.marca,
      modelo: data.modelo,
      color: data.color,
      ano: data.ano,
      estado: data.estado,
      codigo_taxi: data.codigo_taxi,
      vencimiento_revision_tecnica: data.vencimiento_revision_tecnica,
      vencimiento_permiso_circulacion: data.vencimiento_permiso_circulacion,
      deleted_at_taxi: data.deleted_at_taxi,
      estado_taxi: data.estado_taxi
    });
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