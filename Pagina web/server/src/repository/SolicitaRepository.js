import { BaseRepository } from '../core/BaseRepository.js';

export class SolicitaRepository extends BaseRepository {
  constructor() {
    super('solicita');
  }

  /**
   * Creates a new solicita record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    const [result] = await this.db(this.tableName)
      .insert(data)
      .returning('*');
    return result;
  }

  /**
   * Finds solicita records by reservation ID
   * @param {number} codigoreserva - Reservation ID
   * @returns {Promise<Array>} Found records
   */
  async findByReserva(codigoreserva) {
    return await this.db(this.tableName)
      .where({ codigoreserva })
      .select('*');
  }
} 