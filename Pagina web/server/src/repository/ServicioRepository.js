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
    const [result] = await this.db(this.tableName)
      .insert(data)
      .returning('*');
    return this._toModel(result);
  }

  /**
   * Associates tariffs with a service
   * @param {number} servicioId - Service ID
   * @param {Array<number>} tarifaIds - Array of tariff IDs
   * @returns {Promise<void>}
   */
  async associateTariffs(servicioId, tarifaIds) {
    const relations = tarifaIds.map(tarifaId => ({
      servicio_id: servicioId,
      tarifa_id: tarifaId
    }));

    await this.db('servicio_tarifa')
      .where({ servicio_id: servicioId })
      .del();

    if (relations.length > 0) {
      await this.db('servicio_tarifa').insert(relations);
    }
  }

  /**
   * Updates tariffs for a service
   * @param {number} servicioId - Service ID
   * @param {Array<number>} tarifaIds - Array of tariff IDs
   * @returns {Promise<void>}
   */
  async updateTariffs(servicioId, tarifaIds) {
    return this.associateTariffs(servicioId, tarifaIds);
  }

  /**
   * Finds a service by ID
   * @param {number} codigos - Service ID
   * @returns {Promise<Object>} Found service
   */
  async findById(codigos) {
    const result = await this.db(this.tableName)
      .where({ codigos })
      .first();
    return result ? this._toModel(result) : null;
  }

  /**
   * Gets all active services
   * @returns {Promise<Array>} List of active services
   */
  async findActive() {
    const results = await this.db(this.tableName)
      .select('servicio.*')
      .where('servicio.estados', 'ACTIVO')
      .whereNull('servicio.deleteats');

    return results.map(result => this._toModel(result));
  }

  /**
   * Updates a service
   * @param {number} codigos - Service ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated service
   */
  async update(codigos, data) {
    const [result] = await this.db(this.tableName)
      .where({ codigos })
      .update(data)
      .returning('*');
    return this._toModel(result);
  }

  /**
   * Soft deletes a service
   * @param {number} codigos - Service ID
   * @returns {Promise<Object>} Deleted service
   */
  async delete(codigos) {
    const [result] = await this.db(this.tableName)
      .where({ codigos })
      .update({
        estados: 'INACTIVO',
        deleteats: new Date()
      })
      .returning('*');
    return this._toModel(result);
  }
} 