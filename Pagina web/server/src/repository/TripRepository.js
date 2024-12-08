import { BaseRepository } from '../core/BaseRepository.js';
import { TripModel } from '../models/TripModel.js';

export class TripRepository extends BaseRepository {
  constructor() {
    super('viaje', TripModel, 'codigo_viaje');
  }

  /**
   * Find trip by ID
   * @param {number} codigo_viaje - Trip ID
   * @returns {Promise<TripModel>} Trip instance
   */
  async findById(codigo_viaje) {
    try {
      const result = await this.db(this.tableName)
        .where('codigo_viaje', codigo_viaje)
        .first();
      return TripModel.fromDB(result);
    } catch (error) {
      throw new Error(`Error finding trip by ID: ${error.message}`);
    }
  }

  /**
   * Create new trip
   * @param {Object} tripData - Trip data
   * @returns {Promise<Object>} Created trip
   */
  async createTrip(tripData) {
    try {
      const [created] = await this.db(this.tableName)
        .insert(tripData)
        .returning('*');
      return created;
    } catch (error) {
      throw new Error(`Error creating trip: ${error.message}`);
    }
  }

  /**
   * Update trip
   * @param {number} codigo_viaje - Trip ID
   * @param {Object} tripData - Updated trip data
   * @returns {Promise<Object>} Updated trip
   */
  async updateTrip(codigo_viaje, tripData) {
    try {
      const [updated] = await this.db(this.tableName)
        .where('codigo_viaje', codigo_viaje)
        .update(tripData)
        .returning('*');
      return updated;
    } catch (error) {
      throw new Error(`Error updating trip: ${error.message}`);
    }
  }

  /**
   * Soft delete trip
   * @param {number} codigo_viaje - Trip ID
   * @returns {Promise<Object|null>} Deleted trip or null
   */
  async softDelete(codigo_viaje) {
    try {
      const [deletedTrip] = await this.db(this.tableName)
        .where('codigo_viaje', codigo_viaje)
        .update({
          estado_viaje: 'ELIMINADO',
          deleted_at_viaje: new Date()
        })
        .returning('*');
      return deletedTrip ? TripModel.fromDB(deletedTrip) : null;
    } catch (error) {
      throw new Error(`Error soft deleting trip: ${error.message}`);
    }
  }

  /**
   * Find trips by driver RUT
   * @param {number} rut_conductor - Driver's RUT
   * @returns {Promise<Array>} Driver's trips
   */
  async findByDriver(rut_conductor) {
    const results = await this.db(this.tableName)
      .select(
        'viaje.*',
        'reserva.origen_reserva',
        'reserva.destino_reserva',
        'reserva.tipo_reserva'
      )
      .join('reserva', 'viaje.codigo_reserva', 'reserva.codigo_reserva')
      .where('reserva.rut_conductor', rut_conductor)
      .orderBy('viaje.fecha_viaje', 'desc');

    return results.map(result => new this.modelClass(result));
  }

  /**
   * Find trips by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Filtered trips
   */
  async findByDateRange(startDate, endDate) {
    const results = await this.db(this.tableName)
      .select(
        'viaje.*',
        'reserva.origen_reserva',
        'reserva.destino_reserva',
        'reserva.tipo_reserva',
        'persona.nombre as conductor_nombre',
        'persona.apellido as conductor_apellido'
      )
      .join('reserva', 'viaje.codigo_reserva', 'reserva.codigo_reserva')
      .join('persona', 'reserva.rut_conductor', 'persona.rut')
      .whereBetween('viaje.fecha_viaje', [startDate, endDate])
      .orderBy('viaje.fecha_viaje', 'desc');

    return results.map(result => new this.modelClass(result));
  }

  async findByUser(rut) {
    const results = await this.db(this.tableName)
      .select(
        'viaje.*',
        'reserva.origen_reserva',
        'reserva.destino_reserva',
        'reserva.tipo_reserva',
        'persona.nombre as conductor_nombre',
        'persona.apellido as conductor_apellido'
      )
      .join('reserva', 'viaje.codigo_reserva', 'reserva.codigo_reserva')
      .join('persona', 'reserva.rut_conductor', 'persona.rut')
      .where('reserva.rut_pasajero', rut)
      .orderBy('viaje.fecha_viaje', 'desc');

    return results.map(result => new this.modelClass(result));
  }

  /**
   * Find trip with full details
   * @param {number} codigo_viaje - Trip ID
   * @returns {Promise<TripModel|null>} Trip with full details
   */
  async findWithDetails(codigo_viaje) {
    const result = await this.db(this.tableName)
      .select(
        'viaje.*',
        'reserva.origen_reserva',
        'reserva.destino_reserva',
        'reserva.tipo_reserva',
        'reserva.observacion_reserva',
        'persona.nombre as conductor_nombre',
        'persona.apellido as conductor_apellido',
        'taxi.modelo as taxi_modelo',
        'taxi.ano as taxi_ano',
        'taxi.patente'
      )
      .join('reserva', 'viaje.codigo_reserva', 'reserva.codigo_reserva')
      .join('persona', 'reserva.rut_conductor', 'persona.rut')
      .join('taxi', 'reserva.patente_taxi', 'taxi.patente')
      .where('viaje.codigo_viaje', codigo_viaje)
      .first();

    return result ? new this.modelClass(result) : null;
  }

  /**
   * Find all completed trips for a reservation
   * @param {number} codigo_reserva - Reservation ID
   * @returns {Promise<Array>} Completed trips
   */
  async findByReservation(codigo_reserva) {
    const results = await this.db(this.tableName)
      .select('*')
      .where('codigo_reserva', codigo_reserva)
      .orderBy('fecha_viaje', 'desc');

    return results.map(result => new this.modelClass(result));
  }
}

export default TripRepository;