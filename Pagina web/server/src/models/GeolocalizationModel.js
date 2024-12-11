import { BaseModel } from '../core/BaseModel.js';

export class GeolocalizationModel extends BaseModel {
  constructor(data = {}) {
    super();
    this.id_geolocalizacion = data.id_geolocalizacion || null;
    this.latitud = data.latitud || '';
    this.longitud = data.longitud || '';
    this.created_at_geolocalizacion = data.created_at_geolocalizacion || null;
    this.updated_at_geolocalizacion = data.updated_at_geolocalizacion || null;
  }

  /**
   * Convierte los datos de la base de datos al modelo
   * @param {Object} data - Datos crudos de la base de datos
   * @returns {GeolocalizationModel} Instancia del modelo
   */
  static fromDB(data) {
    return new GeolocalizationModel({
      id_geolocalizacion: data.id_geolocalizacion,
      latitud: data.latitud,
      longitud: data.longitud,
      created_at_geolocalizacion: data.created_at_geolocalizacion,
      updated_at_geolocalizacion: data.updated_at_geolocalizacion
    });
  }
}