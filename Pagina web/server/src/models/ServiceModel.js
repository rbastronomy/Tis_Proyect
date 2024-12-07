import { BaseModel } from '../core/BaseModel.js';

export class ServiceModel extends BaseModel {
  static defaultData = {
<<<<<<< HEAD
    codigo_servicio: null,
    tipo_servicio: '',
    descripcion_servicio: '',
    estado_servicio: 'ACTIVO',
    delete_at: null,
=======
    codigos: null,
    tipo: '',
    descripciont: '',
    estados: 'ACTIVO',
    deleted_at_service: null,
>>>>>>> c21906aabcf45981368753789d1ec19379cf086a
  };

  constructor(data = {}) {
    const modelData = {
      ...data
    };

    super(modelData, ServiceModel.defaultData);

  }

  // Getters
  get codigo_servicio() { return this._data.codigo_servicio; }
  get tipo_servicio() { return this._data.tipo_servicio; }
  get descripcion_servicio() { return this._data.descripcion_servicio; }
  get estado_servicio() { return this._data.estado_servicio; }
  get delete_at() { return this._data.delete_at; }

  // Setters


  // Methods
  isActive() {
    return this._data.estado_servicio === 'ACTIVO' && !this._data.delete_at;
  }


  toJSON() {
    const json = {
      codigo_servicio: this._data.codigo_servicio,
      tipo_servicio: this._data.tipo_servicio,
      descripcion_servicio: this._data.descripcion_servicio,
      estado_servicio: this._data.estado_servicio
    };

    return json;
  }

  static fromDB(data) {
    if (!data) return null;
    return new ServiceModel(data);
  }
}