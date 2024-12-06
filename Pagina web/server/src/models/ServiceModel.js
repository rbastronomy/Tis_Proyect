import { BaseModel } from '../core/BaseModel.js';
import { RateModel } from './RateModel.js';

export class ServiceModel extends BaseModel {
  static defaultData = {
    codigos: null,
    id: null, // tarifa ID
    tipo: '',
    descripciont: '',
    estados: 'ACTIVO',
    deleteats: null,
    tarifa: null
  };

  constructor(data = {}) {
    const modelData = {
      ...data,
      tarifa: data.tarifa instanceof RateModel ? data.tarifa : null
    };

    super(modelData, ServiceModel.defaultData);

    if (data.tarifa && !(data.tarifa instanceof RateModel)) {
      this._data.tarifa = new RateModel(data.tarifa);
    }
  }

  // Getters
  get codigos() { return this._data.codigos; }
  get id() { return this._data.id; }
  get tipo() { return this._data.tipo; }
  get descripciont() { return this._data.descripciont; }
  get estados() { return this._data.estados; }
  get deleteats() { return this._data.deleteats; }
  get tarifa() { return this._data.tarifa; }

  // Setters
  set tarifa(value) {
    this._data.tarifa = value instanceof RateModel ? value : new RateModel(value);
  }

  // Methods
  isActive() {
    return this._data.estados === 'ACTIVO' && !this._data.deleteats;
  }

  getTarifa() {
    return this._data.tarifa;
  }

  toJSON() {
    const json = {
      codigos: this._data.codigos,
      id: this._data.id,
      tipo: this._data.tipo,
      descripciont: this._data.descripciont,
      estados: this._data.estados
    };

    if (this._data.tarifa) {
      json.tarifa = this._data.tarifa.toJSON();
    }

    return json;
  }

  static fromDB(data) {
    if (!data) return null;
    return new ServiceModel(data);
  }
}