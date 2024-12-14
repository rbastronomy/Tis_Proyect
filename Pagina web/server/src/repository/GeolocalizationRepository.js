import { BaseRepository } from '../core/BaseRepository.js';
import { GeolocalizationModel } from '../models/GeolocalizationModel.js';

export class GeolocalizationRepository extends BaseRepository {
  constructor() {
    super('geolocalizacion', 'id_geolocalizacion');
  }

  /**
   * Guarda o actualiza la ubicación de un taxi
   * @param {string} patente - Patente del taxi
   * @param {Object} locationData - Datos de ubicación
   * @returns {Promise<GeolocalizationModel>}
   */
  async saveLocation(patente, locationData) {
    try {
      const existing = await this.db(this.tableName)
        .where('patente', patente)
        .first();

      if (existing) {
        const [updated] = await this.db(this.tableName)
          .where('patente', patente)
          .update({
            latitud: locationData.latitude,
            longitud: locationData.longitude,
            updated_at: new Date()
          })
          .returning('*');
        return GeolocalizationModel.fromDB(updated);
      }

      const [created] = await this.db(this.tableName)
        .insert({
          patente,
          latitud: locationData.latitude,
          longitud: locationData.longitude
        })
        .returning('*');
      return GeolocalizationModel.fromDB(created);
    } catch (error) {
      throw new Error(`Error saving location: ${error.message}`);
    }
  }

  /**
   * Obtiene la última ubicación de un taxi
   * @param {string} patente - Patente del taxi
   * @returns {Promise<GeolocalizationModel|null>}
   */
  async getLastLocation(patente) {
    try {
      const location = await this.db(this.tableName)
        .where('patente', patente)
        .first();
      return location ? GeolocalizationModel.fromDB(location) : null;
    } catch (error) {
      throw new Error(`Error getting last location: ${error.message}`);
    }
  }
} 