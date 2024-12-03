import { BaseModel } from '../core/BaseModel.js';

export class HistorialModel extends BaseModel {
  static defaultData = {
    idhistorial: null,
    rut: null,
    accion: '',
    descripcion: '',
    fecha: null
  };

  constructor(data = {}) {
    super(data, HistorialModel.defaultData);
  }

  // Getters
  get idhistorial() { return this._data.idhistorial; }
  get rut() { return this._data.rut; }
  get accion() { return this._data.accion; }
  get descripcion() { return this._data.descripcion; }
  get fecha() { return this._data.fecha; }

  // Domain methods
  getTimeElapsed() {
    const now = new Date();
    const changeDate = new Date(this._data.fecha);
    return Math.floor((now - changeDate) / (1000 * 60 * 60 * 24));
  }

  isRecentChange() {
    return this.getTimeElapsed() < 1;
  }

  toJSON() {
    return {
      idhistorial: this._data.idhistorial,
      rut: this._data.rut,
      accion: this._data.accion,
      descripcion: this._data.descripcion,
      fecha: this._data.fecha,
      tiempoTranscurrido: this.getTimeElapsed()
    };
  }

  static fromDB(data) {
    if (!data) return null;
    return new HistorialModel(data);
  }
} 