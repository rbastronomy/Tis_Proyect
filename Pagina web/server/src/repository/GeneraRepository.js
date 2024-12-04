import { BaseRepository } from '../core/BaseRepository.js';

export class GeneraRepository extends BaseRepository {
  constructor() {
    super('genera');
  }

  /**
   * Creates a new genera record
   * @param {Object} data - The genera data
   * @returns {Promise<Object>} Created genera record
   */
  async create(data) {
    return await this.db(this.tableName).insert(data).returning('*');
  }

  /**
   * Updates a genera record
   * @param {Object} where - The where clause
   * @param {Object} data - The data to update
   * @returns {Promise<Object>} Updated genera record
   */
  async update(where, data) {
    return await this.db(this.tableName)
      .where(where)
      .update(data)
      .returning('*');
  }

  /**
   * Finds genera records by booking ID
   * @param {number} codigoreserva - The booking ID
   * @returns {Promise<Array>} Found genera records
   */
  async findByBooking(codigoreserva) {
    return await this.db(this.tableName)
      .where({ codigoreserva })
      .select('*');
  }
} 