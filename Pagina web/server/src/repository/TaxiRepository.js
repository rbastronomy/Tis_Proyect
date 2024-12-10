import { BaseRepository } from '../core/BaseRepository.js';
import { TaxiModel } from '../models/TaxiModel.js';

export class TaxiRepository extends BaseRepository {
  constructor() {
    super('taxi', 'patente');
  }

  /**
   * Create new taxi
   * @param {Object} taxiData - Taxi data
   * @returns {Promise<Object>} Created taxi
   */
  async create(taxiData) {
    try {
      const [createdTaxi] = await this.db(this.tableName)
        .insert(taxiData)
        .returning('*');
      return TaxiModel.toModel(createdTaxi);
    } catch (error) {
      throw new Error(`Error creating taxi: ${error.message}`);
    }
  }

  /**
   * Update taxi
   * @param {string} patente - Taxi license plate
   * @param {Object} updateData - Updated taxi data
   * @returns {Promise<Object|null>} Updated taxi or null
   */
  async update(patente, updateData) {
    try {
      const [updatedTaxi] = await this.db(this.tableName)
        .where({ patente })
        .update(updateData)
        .returning('*');
      return updatedTaxi ? TaxiModel.toModel(updatedTaxi) : null;
    } catch (error) {
      throw new Error(`Error updating taxi: ${error.message}`);
    }
  }

  /**
   * Soft delete taxi
   * @param {string} patente - Taxi license plate
   * @returns {Promise<Object|null>} Deleted taxi or null
   */
  async softDelete(patente) {
    try {
      const [deletedTaxi] = await this.db(this.tableName)
        .where({ patente })
        .update({
          estado_taxi: 'ELIMINADO',
          deleted_at_taxi: new Date()
        })
        .returning('*');
      return deletedTaxi ? TaxiModel.toModel(deletedTaxi) : null;
    } catch (error) {
      throw new Error(`Error soft deleting taxi: ${error.message}`);
    }
  }

  /**
   * Find taxi by driver
   * @param {number} rut_conductor - Driver's RUT
   * @returns {Promise<Array>} List of taxis
  async findByDriver(rut_conductor) {
    try {
      const results = await this.db(this.tableName)
        .select('*')
        .where({ rut_conductor })
        .whereNull('deleted_at_taxi');
      return results.map(result => TaxiModel.fromDB(result));
    } catch (error) {
      throw new Error(`Error finding taxi by driver: ${error.message}`);
    }
  }
  */
  async findByPate(patente){
    try {
      const taxi = await this.db(this.tableName)
        .select('*')
        .where({ patente })
        .whereNull('deleted_at_taxi')
        .first();
      return taxi ? TaxiModel.toModel(taxi) : null;
    } catch (error) {
      throw new Error(`Error finding taxi by patente: ${error.message}`);
    }
  }
  /**
   * Find taxi with details
   * @param {string} patente - Taxi license plate
   * @returns {Promise<Object|null>} Taxi with details or null
   */
  async findWithDetails(patente) {
    try {
      const result = await this.db(this.tableName)
        .select(
          'taxi.*',
          'persona.nombre as conductor_nombre',
          'persona.apellido as conductor_apellido'
        )
        .leftJoin('persona', 'taxi.rut_conductor', 'persona.rut')
        .where('taxi.patente', patente)
        .whereNull('taxi.deleted_at_taxi')
        .first();

      return result ? TaxiModel.fromDB(result) : null;
    } catch (error) {
      throw new Error(`Error finding taxi with details: ${error.message}`);
    }
  }
}

export default TaxiRepository;