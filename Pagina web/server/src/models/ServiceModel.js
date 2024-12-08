import { BaseModel } from '../core/BaseModel.js';

/**
 * Represents a service data from the database
 * @typedef {Object} ServiceData
 * @property {number} codigo_servicio - Service unique code
 * @property {string} tipo_servicio - Type of service
 * @property {string} descripcion_servicio - Service description
 * @property {('ACTIVO'|'INACTIVO')} estado_servicio - Service status
 * @property {Date} delete_at_servicio - Soft delete timestamp
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * Represents the internal data structure of ServiceModel
 * @typedef {Object} ServiceModelData
 * @property {number|null} codigo_servicio - Service unique code
 * @property {string} tipo_servicio - Type of service
 * @property {string} descripcion_servicio - Service description
 * @property {('ACTIVO'|'INACTIVO')} estado_servicio - Service status
 * @property {Date|null} delete_at_servicio - Soft delete timestamp
 * @property {import('./RateModel.js').RateModel[]} tarifas - Associated rates/tariffs
 * @property {Date|null} created_at - Creation timestamp
 * @property {Date|null} updated_at - Last update timestamp
 */

/**
 * Class representing a Service in the system
 * @extends {BaseModel<ServiceModelData>}
 */
export class ServiceModel extends BaseModel {
  /**
   * Default values for a new service instance
   * @type {ServiceModelData}
   */
  static defaultData = {
    codigo_servicio: null,
    tipo_servicio: '',
    descripcion_servicio: '',
    estado_servicio: 'ACTIVO',
    delete_at_servicio: null,
    tarifas: [],
    created_at: null,
    updated_at: null
  };

  /**
   * Creates a new ServiceModel instance
   * @param {Partial<ServiceModelData>} data - Initial service data
   */
  constructor(data = {}) {
    super(data, ServiceModel.defaultData);
  }

  // Getters
  /** @returns {number} Service code */
  get codigo_servicio() { return this._data.codigo_servicio; }
  /** @returns {string} Service type */
  get tipo_servicio() { return this._data.tipo_servicio; }
  /** @returns {string} Service description */
  get descripcion_servicio() { return this._data.descripcion_servicio; }
  /** @returns {string} Service status */
  get estado_servicio() { return this._data.estado_servicio; }
  /** @returns {Date} Service deletion date */
  get delete_at_servicio() { return this._data.delete_at_servicio; }
  /** @returns {import('./RateModel.js').RateModel[]} Service rates */
  get tarifas() { return this._data.tarifas; }
  /** @param {import('./RateModel.js').RateModel[]} value - Rates to assign to the service */
  set tarifas(value) { this._data.tarifas = value; }

  /**
   * Checks if the service is active
   * @returns {boolean} True if the service is active
   */
  isActive() {
    return this._data.estado_servicio === 'ACTIVO' && !this._data.delete_at_servicio;
  }

  /**
   * Gets rates filtered by type
   * @param {string} rideType - Type of ride (CITY or AIRPORT)
   * @returns {import('./RateModel.js').RateModel[]} Filtered rates
   */
  getRatesByType(rideType) {
    return this._data.tarifas.filter(rate => {
      if (rideType === 'CITY') {
        return rate.tipo === 'TRASLADO_CIUDAD';
      }
      return rate.tipo !== 'TRASLADO_CIUDAD';
    });
  }

  /**
   * Converts the service model to a JSON object
   * @returns {Object} Service data with its rates
   */
  toJSON() {
    return {
      codigo_servicio: this._data.codigo_servicio,
      tipo_servicio: this._data.tipo_servicio,
      descripcion_servicio: this._data.descripcion_servicio,
      estado_servicio: this._data.estado_servicio,
      tarifas: this._data.tarifas,
      created_at: this._data.created_at,
      updated_at: this._data.updated_at
    };
  }
}