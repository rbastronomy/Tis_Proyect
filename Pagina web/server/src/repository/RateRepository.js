import { BaseRepository } from '../core/BaseRepository.js';
import { RateModel } from '../models/RateModel.js';

export class RateRepository extends BaseRepository {
  constructor() {
    super('tarifa', 'id_tarifa');
  }

  /**
   * Create new rate
   * @param {Object} rateData - Rate data
   * @returns {Promise<Object>} Created rate
   */
  async create(rateData) {
    try {
      const [createdRate] = await this.db(this.tableName)
        .insert(rateData)
        .returning('*');
      return RateModel.toModel(createdRate);
    } catch (error) {
      throw new Error(`Error creating rate: ${error.message}`);
    }
  }

  /**
     * Update invoice
     * @param {number} id_tarifa - Invoice ID
     * @param {Object} updateData - Updated invoice data
     * @returns {Promise<Object|null>} Updated invoice or null
     */
    async update(id_tarifa, updateData) {
      try {
        const [updated] = await this.db(this.tableName)
          .where('id_tarifa', id_tarifa)
          .update(updateData)
          .returning('*');
        return updated ? RateModel.toModel(updated) : null;
      } catch (error) {
        throw new Error(`Error actualizando una tarifa: ${error.message}`);
      }
    }

  /**
   * Soft delete rate
   * @param {number} id_tarifa - Rate ID
   * @returns {Promise<Object|null>} Deleted rate or null
   */
  async softDelete(id_tarifa) {
    try {
      const [deletedRate] = await this.db(this.tableName)
        .where({ id_tarifa })
        .update({
          estado_tarifa: 'ELIMINADO',
          fecha_eliminacion_tarifa: new Date(),
          delete_at_tarifa: new Date()
        })
        .returning('*');
      return deletedRate ? RateModel.toModel(deletedRate) : null;
    } catch (error) {
      throw new Error(`Error soft deleting rate: ${error.message}`);
    }
  }

  /**
   * Find active rates
   * @returns {Promise<Array>} List of active rates
   */
  async findActive() {
    try {
      const results = await this.db(this.tableName)
        .where('estado_tarifa', 'ACTIVO')
        .whereNull('fecha_eliminacion_tarifa')
        .select('*');
      return results.map(result => RateModel.toModel(result));
    } catch (error) {
      throw new Error(`Error finding active rates: ${error.message}`);
    }
  }

  /**
   * Find rates by ride type (CITY or AIRPORT)
   * @param {string} rideType - Type of ride
   * @returns {Promise<Array>} List of rates for the specified ride type
   */
  async findByRideType(rideType) {
    try {
      const query = this.db(this.tableName)
        .select(
          'tarifa.*',
          'servicio_tarifa.codigo_servicio'
        )
        .join('servicio_tarifa', 'tarifa.id_tarifa', 'servicio_tarifa.id_tarifa')
        .where('tarifa.estado_tarifa', 'ACTIVO')
        .whereNull('tarifa.fecha_eliminacion_tarifa');

      if (rideType === 'CITY') {
        query.where('tarifa.tipo_tarifa', 'TRASLADO_CIUDAD');
      } else {
        query.whereNot('tarifa.tipo_tarifa', 'TRASLADO_CIUDAD');
      }

      const results = await query;
      return results.map(result => RateModel.toModel(result));
    } catch (error) {
      throw new Error(`Error finding rates by ride type: ${error.message}`);
    }
  }

  /**
   * Find rates for a service filtered by ride type
   * @param {number} codigo_servicio - Service ID
   * @param {string} rideType - Type of ride
   * @returns {Promise<Array>} List of filtered rates
   */
  async findByServiceAndType(codigo_servicio, rideType) {
    try {
      const query = this.db(this.tableName)
        .select('tarifa.*')
        .join('servicio_tarifa', 'tarifa.id_tarifa', 'servicio_tarifa.id_tarifa')
        .where({
          'servicio_tarifa.codigo_servicio': codigo_servicio,
          'tarifa.estado_tarifa': 'ACTIVO'
        })
        .whereNull('tarifa.fecha_eliminacion_tarifa');

      if (rideType === 'CITY') {
        query.where('tarifa.tipo_tarifa', 'TRASLADO_CIUDAD');
      } else {
        query.whereNot('tarifa.tipo_tarifa', 'TRASLADO_CIUDAD');
      }

      const results = await query;
      return results.map(result => RateModel.toModel(result));
    } catch (error) {
      throw new Error(`Error finding rates by service and type: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const rates = await this.db(this.tableName)
        .select('*')
        .whereNull('fecha_eliminacion_tarifa');
      return rates.map(rate => RateModel.toModel(rate));
    } catch (error) {
      throw new Error(`Error getting all rates: ${error.message}`);
    }
  }

  /**
   * Find rate by type
   * @param {string} tipo_tarifa - Rate type
   * @returns {Promise<Object|null>} Found rate or null
   */
  async findByType(tipo_tarifa) {
    try {
      const result = await this.db(this.tableName)
        .where({
          tipo_tarifa,
          estado_tarifa: 'ACTIVO'
        })
        .whereNull('fecha_eliminacion_tarifa')
        .first();
      return result ? RateModel.toModel(result) : null;
    } catch (error) {
      throw new Error(`Error finding rate by type: ${error.message}`);
    }
  }
}

export default RateRepository;