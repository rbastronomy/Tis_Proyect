import { BaseModel } from '../core/BaseModel.js';

export class TaxiModel extends BaseModel {
  constructor() {
    super('taxi');
  }

  /**
   * Create a new taxi
   * @param {Object} data - Taxi data to create
   * @returns {Object} Created taxi
   */
  async createTaxi(data) {
    return this.db(this.tableName)
      .insert(data)
      .returning('*');
  }

  /**
   * Find a taxi by license plate
   * @param {string} patente - Taxi license plate
   * @returns {Object|null} Taxi details or null
   */
  async getByLicensePlate(patente) {
    return this.db(this.tableName)
      .where({ patente })
      .first();
  }

  /**
   * Find taxis by driver (RUT)
   * @param {number} rut - Driver's RUT
   * @returns {Array} List of taxis
   */
  async getTaxisByDriver(rut) {
    return this.db(this.tableName)
      .where({ rut });
  }

  /**
   * Update taxi status
   * @param {string} patente - Taxi license plate
   * @param {Object} statusData - Status update data
   * @returns {Object} Updated taxi
   */
  async updateTaxiStatus(patente, statusData) {
    return this.db(this.tableName)
      .where({ patente })
      .update(statusData)
      .returning('*');
  }

  /**
   * Get taxis by specific criteria
   * @param {Object} criteria - Search criteria
   * @returns {Array} Filtered taxis
   */
  async searchTaxis(criteria) {
    return this.db(this.tableName)
      .where(criteria);
  }

  /**
   * Soft delete a taxi
   * @param {string} patente - Taxi license plate
   * @returns {Object} Updated taxi
   */
  async softDeleteTaxi(patente) {
    return this.db(this.tableName)
      .where({ patente })
      .update({ 
        deletedattx: new Date(), 
        estadotx: 'ELIMINADO' 
      })
      .returning('*');
  }

  /**
   * Check technical review status
   * @param {string} patente - Taxi license plate
   * @returns {boolean} Whether technical review is current
   */
  async isTechnicalReviewCurrent(patente) {
    const taxi = await this.getByLicensePlate(patente);
    if (!taxi) return false;

    const reviewDate = new Date(taxi.revisiontecnica);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return reviewDate > oneYearAgo;
  }
}