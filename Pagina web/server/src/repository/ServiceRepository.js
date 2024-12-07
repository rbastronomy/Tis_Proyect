import { BaseRepository } from '../core/BaseRepository.js';
import { ServiceModel } from '../models/ServiceModel.js';

export class ServiceRepository extends BaseRepository {
  constructor() {
    super('servicio', ServiceModel, 'codigo_servicio');
  }

  /**
   * Creates a new service
   * @param {Object} serviceData - Service data
   * @returns {Promise<Object>} Created service
   */
  async create(serviceData) {
    try {
      const [createdService] = await this.db(this.tableName)
        .insert(serviceData)
        .returning('*');
      return ServiceModel.fromDB(createdService);
    } catch (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  /**
   * Updates a service
   * @param {number} codigo_servicio - Service ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated service or null
   */
  async update(codigo_servicio, updateData) {
    try {
      const [updatedService] = await this.db(this.tableName)
        .where({ codigo_servicio })
        .update(updateData)
        .returning('*');
      return updatedService ? ServiceModel.fromDB(updatedService) : null;
    } catch (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }
  }

  /**
   * Soft deletes a service
   * @param {number} codigo_servicio - Service ID
   * @returns {Promise<Object|null>} Deleted service or null
   */
  async softDelete(codigo_servicio) {
    try {
      const [deletedService] = await this.db(this.tableName)
        .where({ codigo_servicio })
        .update({
          estado_servicio: 'INACTIVO',
          delete_at: new Date()
        })
        .returning('*');
      return deletedService ? ServiceModel.fromDB(deletedService) : null;
    } catch (error) {
      throw new Error(`Error soft deleting service: ${error.message}`);
    }
  }

  /**
   * Associates rates with a service
   * @param {number} codigo_servicio - Service ID
   * @param {Array<number>} rateIds - Array of rate IDs
   * @returns {Promise<void>}
   */
  async associateRates(codigo_servicio, rateIds) {
    const relations = rateIds.map(rateId => ({
      codigo_servicio,
      id_tarifa: rateId
    }));

    await this.db('servicio_tarifa')
      .where({ codigo_servicio })
      .del();

    if (relations.length > 0) {
      await this.db('servicio_tarifa').insert(relations);
    }
  }

  /**
   * Updates rates for a service
   * @param {number} codigo_servicio - Service ID
   * @param {Array<number>} rateIds - Array of rate IDs
   * @returns {Promise<void>}
   */
  async updateRates(codigo_servicio, rateIds) {
    return this.associateRates(codigo_servicio, rateIds);
  }

  /**
   * Finds a service by ID
   * @param {number} codigo_servicio - Service ID
   * @returns {Promise<Object|null>} Found service or null
   */
  async findById(codigo_servicio) {
    const result = await this.db(this.tableName)
      .where({ codigo_servicio })
      .first();
    return result ? ServiceModel.fromDB(result) : null;
  }

  /**
   * Gets all active services
   * @returns {Promise<Array>} List of active services
   */
  async findActive() {
    const results = await this.db(this.tableName)
      .select('servicio.*')
      .where('servicio.estado_servicio', 'ACTIVO')
      .whereNull('servicio.delete_at_servicio');

    return results;
  }
}

export default ServiceRepository;