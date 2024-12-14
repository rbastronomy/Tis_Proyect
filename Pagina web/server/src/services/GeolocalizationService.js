import { BaseService } from '../core/BaseService.js';
import { GeolocalizationRepository } from '../repository/GeolocalizationRepository.js';

export class GeolocalizationService extends BaseService {
  constructor() {
    const geolocalizationRepository = new GeolocalizationRepository();
    super(geolocalizationRepository);
  }

  /**
   * Actualiza la ubicación de un taxi
   * @param {string} patente - Patente del taxi
   * @param {Object} locationData - Datos de ubicación
   * @returns {Promise<Object>} Ubicación actualizada
   */
  async updateLocation(patente, locationData) {
    return await this.repository.saveLocation(patente, locationData);
  }

  /**
   * Obtiene la última ubicación de un taxi
   * @param {string} patente - Patente del taxi
   * @returns {Promise<Object|null>} Última ubicación o null
   */
  async getLastLocation(patente) {
    return await this.repository.getLastLocation(patente);
  }
} 