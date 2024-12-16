import { BaseModel } from '../core/BaseModel.js';

/**
 * @typedef {Object} ReportData
 * @property {string} type - Tipo de reporte
 * @property {Object} filters - Filtros aplicados
 * @property {Object} data - Datos del reporte
 * @property {Date} generatedAt - Fecha de generación
 */

/**
 * Modelo para representar un reporte generado
 */
export class ReportModel extends BaseModel {
  static REPORT_TYPES = {
    BOOKINGS_BY_TAXI: 'BOOKINGS_BY_TAXI',
    BOOKINGS_BY_CLIENT: 'BOOKINGS_BY_CLIENT',
    TRIPS_BY_TAXI: 'TRIPS_BY_TAXI',
    INCOME_BY_TAXI: 'INCOME_BY_TAXI'
  };

  /**
   * @param {Object} params - Parámetros del reporte
   * @param {string} params.type - Tipo de reporte
   * @param {Array} params.data - Datos del reporte
   * @param {Date} params.generatedAt - Fecha de generación
   * @param {string} params.generatedBy - ID del usuario que generó el reporte
   * @param {Object} params.filters - Filtros aplicados al reporte
   */
  constructor({ type, data, generatedAt, generatedBy, filters }) {
    super({ type, data, generatedAt, generatedBy, filters });
    this.validate();
  }

  validate() {
    this.validateEnum('type', this._data.type, Object.values(ReportModel.REPORT_TYPES));
    // Otras validaciones según necesites
  }

  /**
   * Convierte el modelo a un objeto plano para la respuesta JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      type: this._data.type,
      data: this._data.data,
      generatedAt: this._data.generatedAt.toISOString(),
      generatedBy: this._data.generatedBy,
      filters: this._data.filters
    };
  }
} 