export class TaxiRepository extends BaseRepository {
  constructor() {
    super('taxi'); // Assuming BaseRepository takes the table name in constructor
  }

  /**
   * Create a new taxi with additional validation or processing
   * @param {Object} taxiData - Taxi creation data
   * @returns {Object} Created taxi
   */
  async createTaxi(taxiData) {
    // Perform any specific validation or preprocessing
    this.validateTaxiData(taxiData);
    
    return this.create(taxiData);
  }

  /**
   * Find taxis by driver
   * @param {number} rut - Driver's RUT
   * @returns {Array} List of taxis
   */
  async findTaxisByDriver(rut) {
    return this.findBy({ rut });
  }

  /**
   * Soft delete a taxi
   * @param {string} patente - Taxi license plate
   * @returns {Object} Deleted taxi record
   */
  async softDeleteTaxi(patente) {
    return this.update(patente, {
      deletedattx: new Date(),
      estadotx: 'ELIMINADO'
    });
  }

  /**
   * Check if technical review is current
   * @param {string} patente - Taxi license plate
   * @returns {boolean} Technical review status
   */
  async isTechnicalReviewCurrent(patente) {
    const taxi = await this.findById(patente);
    if (!taxi) return false;

    const reviewDate = new Date(taxi.revisiontecnica);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return reviewDate > oneYearAgo;
  }

  /**
   * Validate taxi data before creation or update
   * @param {Object} taxiData - Taxi data to validate
   * @throws {Error} If validation fails
   */
  validateTaxiData(taxiData) {
    const requiredFields = ['patente', 'rut', 'modelo', 'ano'];
    
    // Check for required fields
    for (const field of requiredFields) {
      if (!taxiData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Additional custom validations
    if (taxiData.ano && (taxiData.ano < 1900 || taxiData.ano > new Date().getFullYear())) {
      throw new Error('Invalid year for taxi');
    }

    // Validate license plate format (example regex)
    if (taxiData.patente && !/^[A-Z]{2}\d{4}$/.test(taxiData.patente)) {
      throw new Error('Invalid license plate format');
    }
  }

  /**
   * Advanced search with flexible criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} [options] - Additional search options
   * @returns {Array} Filtered and paginated results
   */
  async searchTaxis(criteria, options = {}) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'ano',
      sortOrder = 'DESC'
    } = options;

    // Remove undefined values from criteria
    const cleanedCriteria = Object.fromEntries(
      Object.entries(criteria).filter(([, v]) => v !== undefined)
    );

    return this.findAndPaginate(cleanedCriteria, {
      page,
      pageSize,
      sortBy,
      sortOrder
    });
  }
}