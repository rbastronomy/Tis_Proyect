import { BaseRepository } from '../core/BaseRepository.js';
import { ReservaModel } from '../models/ReservaModel.js';

export class ReservaRepository extends BaseRepository {
  constructor() {
    super('reserva', ReservaModel, 'codigoreserva');
  }

  /**
   * Find reservas with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered reservas
   */
  async findWithFilters(filters) {
    const query = this.db(this.tableName)
      .select('*')
      .whereNull('deletedatre');

    if (filters.estados) {
      query.where('estados', filters.estados);
    }

    if (filters.fecha) {
      query.where('freserva', filters.fecha);
    }

    if (filters.userId) {
      query.where('rut_conductor', filters.userId);
    }

    const results = await query;
    return results.map(result => new this.modelClass(result));
  }

  /**
   * Find reservas by status
   * @param {string} status - Status to filter by
   * @returns {Promise<Array>} Filtered reservas
   */
  async findByStatus(status) {
    const results = await this.db(this.tableName)
      .select('*')
      .where('estados', status)
      .whereNull('deletedatre');

    return results.map(result => new this.modelClass(result));
  }

  /**
   * Find active reservas for a driver
   * @param {number} driverId - Driver's RUT
   * @returns {Promise<Array>} Driver's active reservas
   */
  async findActiveByDriver(driverId) {
    const results = await this.db(this.tableName)
      .select('*')
      .where('rut_conductor', driverId)
      .whereIn('estados', ['PENDIENTE', 'EN_CAMINO'])
      .whereNull('deletedatre');

    return results.map(result => new this.modelClass(result));
  }

  /**
   * Find reserva by ID with related data
   * @param {number} id - Reserva ID
   * @returns {Promise<ReservaModel|null>} Reserva with related data
   */
  async findByIdWithRelations(id) {
    const result = await this.db(this.tableName)
      .select(
        'reserva.*',
        'persona.nombre as conductor_nombre',
        'persona.apellido as conductor_apellido',
        'taxi.modelo as taxi_modelo',
        'taxi.ano as taxi_ano'
      )
      .leftJoin('persona', 'reserva.rut_conductor', 'persona.rut')
      .leftJoin('taxi', 'reserva.patente_taxi', 'taxi.patente')
      .where('reserva.codigoreserva', id)
      .whereNull('reserva.deletedatre')
      .first();

    return result ? new this.modelClass(result) : null;
  }
} 