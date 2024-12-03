import { BaseRepository } from '../core/BaseRepository.js';
import { HistorialModel } from '../models/HistorialModel.js';

export class HistorialRepository extends BaseRepository {
  constructor() {
    super('historial', HistorialModel, 'idhistorial');
  }

  /**
   * Find historial entries by user RUT
   * @param {number} rut - User RUT
   * @returns {Promise<Array>} User's historial entries
   */
  async findByUser(rut) {
    const results = await this.db(this.tableName)
      .select('*')
      .where('rut', rut)
      .orderBy('fecha', 'desc');

    return results.map(result => new this.modelClass(result));
  }

  /**
   * Find historial entries by action type
   * @param {string} accion - Action type
   * @returns {Promise<Array>} Filtered historial entries
   */
  async findByAction(accion) {
    const results = await this.db(this.tableName)
      .select('*')
      .where('accion', accion)
      .orderBy('fecha', 'desc');

    return results.map(result => new this.modelClass(result));
  }

  /**
   * Find historial entries by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Filtered historial entries
   */
  async findByDateRange(startDate, endDate) {
    const results = await this.db(this.tableName)
      .select('*')
      .whereBetween('fecha', [startDate, endDate])
      .orderBy('fecha', 'desc');

    return results.map(result => new this.modelClass(result));
  }
} 