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
   * Finds tariff by type
   * @param {string} tipo - Tariff type
   * @returns {Promise<Object>} Found tariff
   */
  async findByTipo(tipo) {
    const result = await this.db(this.tableName)
      .where({ tipo, estadot: 'ACTIVO' })
      .whereNull('deletedatt')
      .first();
    return this._toModel(result);
  }
} 