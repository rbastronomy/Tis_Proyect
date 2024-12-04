import { BaseRepository } from '../core/BaseRepository.js';
import { TarifaModel } from '../models/TarifaModel.js';

export class TarifaRepository extends BaseRepository {
  constructor() {
    super('tarifa', TarifaModel, 'id');
  }

  /**
   * Finds active tariffs
   * @returns {Promise<Array>} List of active tariffs
   */
  async findActive() {
    const results = await this.db(this.tableName)
      .where('estadot', 'ACTIVO')
      .whereNull('deletedatt')
      .select('*');
    return results.map(result => this._toModel(result));
  }

  /**
   * Finds tariffs by ride type (CITY or AIRPORT)
   * @param {string} rideType - Type of ride
   * @returns {Promise<Array>} List of tariffs for the specified ride type
   */
  async findByRideType(rideType) {
    const query = this.db(this.tableName)
      .select(
        'tarifa.*',
        'servicio_tarifa.servicio_id'
      )
      .join('servicio_tarifa', 'tarifa.id', 'servicio_tarifa.tarifa_id')
      .where('tarifa.estadot', 'ACTIVO')
      .whereNull('tarifa.deletedatt');

    if (rideType === 'CITY') {
      query.where('tarifa.tipo', 'TRASLADO_CIUDAD');
    } else {
      query.whereNot('tarifa.tipo', 'TRASLADO_CIUDAD');
    }

    const results = await query;
    return results.map(result => this._toModel(result));
  }

  /**
   * Finds active tariffs for a specific service
   * @param {number} servicioId - Service ID
   * @returns {Promise<Array>} List of active tariffs for the service
   */
  async findActiveByService(servicioId) {
    const results = await this.db(this.tableName)
      .select('tarifa.*')
      .join('servicio_tarifa', 'tarifa.id', 'servicio_tarifa.tarifa_id')
      .where({
        'servicio_tarifa.servicio_id': servicioId,
        'tarifa.estadot': 'ACTIVO'
      })
      .whereNull('tarifa.deletedatt');

    return results.map(result => this._toModel(result));
  }

  /**
   * Finds tariffs for a service filtered by ride type
   * @param {number} servicioId - Service ID
   * @param {string} rideType - Type of ride
   * @returns {Promise<Array>} List of filtered tariffs
   */
  async findByServiceAndType(servicioId, rideType) {
    const query = this.db(this.tableName)
      .select('tarifa.*')
      .join('servicio_tarifa', 'tarifa.id', 'servicio_tarifa.tarifa_id')
      .where({
        'servicio_tarifa.servicio_id': servicioId,
        'tarifa.estadot': 'ACTIVO'
      })
      .whereNull('tarifa.deletedatt');

    if (rideType === 'CITY') {
      query.where('tarifa.tipo', 'TRASLADO_CIUDAD');
    } else {
      query.whereNot('tarifa.tipo', 'TRASLADO_CIUDAD');
    }

    const results = await query;
    return results.map(result => this._toModel(result));
  }

  /**
   * Finds tariff by type
   * @param {string} tipo - Tariff type
   * @returns {Promise<Object>} Found tariff
   */
  async findByTipo(tipo) {
    const result = await this.db(this.tableName)
      .where({ tipo, estadot: 'ACTIVO' })
      .whereNull('deletedatt')
      .first();
    return result ? this._toModel(result) : null;
  }
} 