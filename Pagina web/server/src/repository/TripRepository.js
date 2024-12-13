import { BaseRepository } from '../core/BaseRepository.js';
import { TripModel } from '../models/TripModel.js';

export class TripRepository extends BaseRepository {
  constructor() {
    super('viaje', 'codigo_viaje');
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
   * @returns {Promise<Array>} Driver's trips with basic details
   */
  async findByDriver(rut_conductor) {
      const query = this.db(this.tableName)
        .select([
          // Solo los campos esenciales
          'viaje.codigo_viaje',
          'viaje.fecha_viaje',
          'viaje.estado_viaje',
          'viaje.duracion',
          // Datos de la reserva
          'reserva.origen_reserva',
          'reserva.destino_reserva',
          'reserva.tipo_reserva',
          // Datos del cliente
          'cliente.nombre as cliente_nombre',
          'cliente.apellido as cliente_apellido',
          'cliente.telefono as cliente_telefono',
          // Datos del taxi
          'taxi.patente',
          // Datos de pago
          'tarifa.precio',
          'boleta.total as boleta_total'
        ])
        .join('reserva', 'viaje.codigo_reserva', 'reserva.codigo_reserva')
        .leftJoin('persona as cliente', 'reserva.rut_cliente', 'cliente.rut')
        .leftJoin('taxi', 'reserva.patente_taxi', 'taxi.patente')
        .leftJoin('oferta', 'reserva.id_oferta', 'oferta.id_oferta')
        .leftJoin('tarifa', 'oferta.id_tarifa', 'tarifa.id_tarifa')
        .leftJoin('boleta', 'viaje.codigo_viaje', 'boleta.codigo_viaje')
        .where('reserva.rut_conductor', rut_conductor)
        .whereNull('viaje.deleted_at_viaje')
        .orderBy('viaje.fecha_viaje', 'desc');

      const results = await query;
    return results;
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

  /**
   * Find trips by user RUT with full details
   * @param {string} rut - User's RUT
   * @returns {Promise<Array<TripModel>>} User's trips with full details
   */
  async findByUser(rut) {
      const query = this.db(this.tableName)
        .select([
          // Solo los campos esenciales
          'viaje.codigo_viaje',
          'viaje.fecha_viaje',
          'viaje.estado_viaje',
          'viaje.duracion',
          'reserva.origen_reserva',
          'reserva.destino_reserva',
          'reserva.tipo_reserva',
          'conductor.nombre as conductor_nombre',
          'conductor.apellido as conductor_apellido',
          'tarifa.precio',
          'boleta.total as boleta_total'
        ])
        .join('reserva', 'viaje.codigo_reserva', 'reserva.codigo_reserva')
        .leftJoin('persona as conductor', 'reserva.rut_conductor', 'conductor.rut')
        .leftJoin('oferta', 'reserva.id_oferta', 'oferta.id_oferta')
        .leftJoin('tarifa', 'oferta.id_tarifa', 'tarifa.id_tarifa')
        .leftJoin('boleta', 'viaje.codigo_viaje', 'boleta.codigo_viaje')
        .where('reserva.rut_cliente', rut)
        .whereNull('viaje.deleted_at_viaje')
        .orderBy('viaje.fecha_viaje', 'desc');

      const results = await query;

      return results;
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

  /**
   * Find summarized trips by user RUT
   * @param {string} rut - User's RUT
   * @returns {Promise<Array<TripModel>>} User's trips with basic details
   */
    
}

export default TripRepository;