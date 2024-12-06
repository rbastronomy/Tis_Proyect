import { BaseModel } from '../core/BaseModel.js';

export class ServiceModel extends BaseModel {
  static defaultData = {
    codigos: null,
    tipo: '',
    descripciont: '',
    estados: 'ACTIVO',
    deleteats: null,
  };

  constructor(data = {}) {
    const modelData = {
      ...data
    };

    super(modelData, ServiceModel.defaultData);

  }

  // Getters
  get codigos() { return this._data.codigos; }
  get tipo() { return this._data.tipo; }
  get descripciont() { return this._data.descripciont; }
  get estados() { return this._data.estados; }
  get deleteats() { return this._data.deleteats; }

  // Setters


  // Methods
  isActive() {
    return this._data.estados === 'ACTIVO' && !this._data.deleteats;
  }


  toJSON() {
    const json = {
      codigos: this._data.codigos,
      tipo: this._data.tipo,
      descripciont: this._data.descripciont,
      estados: this._data.estados
    };

    return json;
  }

  static fromDB(data) {
    if (!data) return null;
    return new ServiceModel(data);
  }
}