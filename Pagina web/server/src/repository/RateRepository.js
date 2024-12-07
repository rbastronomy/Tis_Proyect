import { BaseRepository } from '../core/BaseRepository.js';
import { RateModel } from '../models/RateModel.js';

export class RateRepository extends BaseRepository {
  constructor() {
    super('tarifa', RateModel, 'id_tarifa');
  }

  /**
   * Create new rate
   * @param {Object} rateData - Rate data
   * @returns {Promise<Object>} Created rate
   */
  async create(rateData) {
    try {
      const [createdRate] = await this.db(this.tableName)
        .insert({
          ...rateData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      return RateModel.fromDB(createdRate);
    } catch (error) {
      throw new Error(`Error creating rate: ${error.message}`);
    }
  }

  /**
   * Update rate
   * @param {number} id_tarifa - Rate ID
   * @param {Object} updateData - Updated rate data
   * @returns {Promise<Object|null>} Updated rate or null
   */
  async update(id_tarifa, updateData) {
    try {
      const [updatedRate] = await this.db(this.tableName)
        .where({ id_tarifa })
        .update({
          ...updateData,
          updated_at: new Date()
        })
        .returning('*');
      return updatedRate ? RateModel.fromDB(updatedRate) : null;
    } catch (error) {
      throw new Error(`Error updating rate: ${error.message}`);
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
          updated_at: new Date()
        })
        .returning('*');
      return deletedRate ? RateModel.fromDB(deletedRate) : null;
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
      return results.map(result => RateModel.fromDB(result));
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
      return results.map(result => RateModel.fromDB(result));
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
      return results.map(result => RateModel.fromDB(result));
    } catch (error) {
      throw new Error(`Error finding rates by service and type: ${error.message}`);
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
      return result ? RateModel.fromDB(result) : null;
    } catch (error) {
      throw new Error(`Error finding rate by type: ${error.message}`);
    }
  }
}

export default RateRepository;