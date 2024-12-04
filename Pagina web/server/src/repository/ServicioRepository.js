import { BaseRepository } from '../core/BaseRepository.js';
import { ServiceModel } from '../models/ServiceModel.js';

export class ServicioRepository extends BaseRepository {
  constructor() {
    super('servicio', ServiceModel, 'codigos');
  }

  /**
   * Creates a new service
   * @param {Object} data - Service data
   * @returns {Promise<Object>} Created service
   */
  async create(data) {
    return await this.db(this.tableName).insert(data).returning('*');
  }

  /**
   * Finds a service by ID
   * @param {number} codigos - Service ID
   * @returns {Promise<Object>} Found service
   */
  async findById(codigos) {
    return await this.db(this.tableName)
      .where({ codigos })
      .first();
  }

  /**
   * Gets all active services
   * @returns {Promise<Array>} List of active services
   */
  async findActive() {
    return await this.db(this.tableName)
      .select(
        'servicio.*',
        'tarifa.precio',
        'tarifa.descripciont as tarifa_descripcion'
      )
      .leftJoin('tarifa', 'servicio.id', 'tarifa.id')
      .where('servicio.estados', 'ACTIVO')
      .whereNull('servicio.deleteats')
      .whereNull('tarifa.deletedatt');
  }

  /**
   * Updates a service
   * @param {number} codigos - Service ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated service
   */
  async update(codigos, data) {
    return await this.db(this.tableName)
      .where({ codigos })
      .update(data)
      .returning('*');
  }

  /**
   * Soft deletes a service
   * @param {number} codigos - Service ID
   * @returns {Promise<Object>} Deleted service
   */
  async delete(codigos) {
    return await this.db(this.tableName)
      .where({ codigos })
      .update({
        estados: 'INACTIVO',
        deleteats: new Date()
      })
      .returning('*');
  }
} 