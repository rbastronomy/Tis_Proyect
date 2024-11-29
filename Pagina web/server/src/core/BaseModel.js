import { db } from '../db/database.js';

export class BaseModel {
  /**
   * @param {Object} data - Datos iniciales del modelo
   */
  constructor(data = {}) {
    this._data = { ...data };
  }

  /**
   * Convierte el modelo a un objeto JSON plano
   * @returns {Object}
   */
  toJSON() {
    return { ...this._data };
  }

  /**
   * Actualiza las propiedades del modelo
   * @param {Object} data - Nuevos datos para actualizar
   */
  update(data) {
    Object.assign(this._data, data);
  }

  /**
   * Obtiene las propiedades que han sido modificadas
   * @param {Object} newData - Nuevos datos para comparar
   * @returns {Object}
   */
  getDirtyProperties(newData) {
    const dirtyProps = {};
    Object.keys(newData).forEach(key => {
      if (this._data[key] !== newData[key]) {
        dirtyProps[key] = newData[key];
      }
    });
    return dirtyProps;
  }
}