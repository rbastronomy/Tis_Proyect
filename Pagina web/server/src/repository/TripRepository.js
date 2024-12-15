import { BaseRepository } from '../core/BaseRepository.js';

export class TripRepository extends BaseRepository {
  constructor() {
    super('viaje', 'codigo_viaje');
  }

  /**
   * Find trip by ID
   * @param {number} codigo_viaje - Trip ID
   * @returns {Promise<Object|null>} Raw trip data or null
   */
  async findById(codigo_viaje) {
    try {
      return await this.db(this.tableName)
        .where('codigo_viaje', codigo_viaje)
        .whereNull('deleted_at_viaje')
        .first();
    } catch (error) {
      throw new Error(`Error finding trip by ID: ${error.message}`);
    }
  }

  /**
   * Create new trip
   * @param {Object} tripData - Trip data
   * @param {Object} [trx] - Optional transaction object
   * @returns {Promise<Object>} Created trip raw data
   */
  async create(tripData, trx = null) {
    try {
      console.log('Creating trip with data:', tripData);

      const query = (trx || this.db)(this.tableName)
        .insert({
          ...tripData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      const [created] = await query;
      console.log('Created trip:', created);
      return created;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw new Error(`Error creating trip: ${error.message}`);
    }
  }

  /**
   * Update trip
   * @param {number} codigo_viaje - Trip ID
   * @param {Object} tripData - Updated trip data
   * @param {Object} [trx] - Optional transaction object
   * @returns {Promise<Object|null>} Updated trip raw data or null
   */
  async update(codigo_viaje, tripData, trx = null) {
    try {
      const query = (trx || this.db)(this.tableName)
        .where('codigo_viaje', codigo_viaje)
        .whereNull('deleted_at_viaje')
        .update({
          ...tripData,
          updated_at: new Date()
        })
        .returning('*');

      const [updated] = await query;
      return updated || null;
    } catch (error) {
      throw new Error(`Error updating trip: ${error.message}`);
    }
  }

  /**
   * Soft delete trip
   * @param {number} codigo_viaje - Trip ID
   * @param {Object} [trx] - Optional transaction object
   * @returns {Promise<Object|null>} Deleted trip raw data or null
   */
  async softDelete(codigo_viaje, trx = null) {
    try {
      const query = (trx || this.db)(this.tableName)
        .where('codigo_viaje', codigo_viaje)
        .whereNull('deleted_at_viaje')
        .update({
          deleted_at_viaje: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      const [deleted] = await query;
      return deleted || null;
    } catch (error) {
      throw new Error(`Error soft deleting trip: ${error.message}`);
    }
  }

  /**
   * Find trips by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Raw trip data array
   */
  async findByDateRange(startDate, endDate) {
    try {
      return await this.db(this.tableName)
        .whereNull('deleted_at_viaje')
        .whereBetween('fecha_viaje', [startDate, endDate])
        .orderBy('fecha_viaje', 'desc');
    } catch (error) {
      throw new Error(`Error finding trips by date range: ${error.message}`);
    }
  }

  /**
   * Find all trips for a booking
   * @param {number} codigo_reserva - Booking ID
   * @returns {Promise<Array>} Raw trip data array
   */
  async findByBooking(codigo_reserva) {
    try {
      return await this.db(this.tableName)
        .select('viaje.*')
        .join('genera', 'viaje.codigo_viaje', 'genera.codigo_viaje')
        .where('genera.codigo_reserva', codigo_reserva)
        .whereNull('viaje.deleted_at_viaje')
        .orderBy('viaje.fecha_viaje', 'desc');
    } catch (error) {
      throw new Error(`Error finding trips by booking: ${error.message}`);
    }
  }

  /**
   * Find trips by driver RUT through booking relationship
   * @param {number} rut_conductor - Driver's RUT
   * @returns {Promise<Array>} Raw trip data array
   */
  async findByDriver(rut_conductor) {
    try {
      return await this.db(this.tableName)
        .select('viaje.*')
        .join('genera', 'viaje.codigo_viaje', 'genera.codigo_viaje')
        .join('reserva', 'genera.codigo_reserva', 'reserva.codigo_reserva')
        .where('reserva.rut_conductor', rut_conductor)
        .whereNull('viaje.deleted_at_viaje')
        .orderBy('viaje.fecha_viaje', 'desc');
    } catch (error) {
      throw new Error(`Error finding trips by driver: ${error.message}`);
    }
  }

  /**
   * Find trips by user (client) RUT through booking relationship
   * @param {string} rut - User's RUT
   * @returns {Promise<Array>} Raw trip data array
   */
  async findByUser(rut) {
    try {
      return await this.db(this.tableName)
        .select('viaje.*')
        .join('genera', 'viaje.codigo_viaje', 'genera.codigo_viaje')
        .join('reserva', 'genera.codigo_reserva', 'reserva.codigo_reserva')
        .where('reserva.rut_cliente', rut)
        .whereNull('viaje.deleted_at_viaje')
        .orderBy('viaje.fecha_viaje', 'desc');
    } catch (error) {
      throw new Error(`Error finding trips by user: ${error.message}`);
    }
  }

  /**
   * Find trip with its booking reference and receipt
   * @param {number} codigo_reserva - Booking ID
   * @returns {Promise<Object|null>} Raw trip data or null
   */
  async findWithBookingRef(codigo_reserva) {
    try {
      return await this.db(this.tableName)
        .select(
          'viaje.*',
          'reserva.codigo_reserva',
          'reserva.origen_reserva',
          'reserva.destino_reserva',
          'boleta.codigo_boleta',
          'boleta.total',
          'boleta.metodo_pago',
          'boleta.fecha_emision'
        )
        .join('genera', 'viaje.codigo_viaje', 'genera.codigo_viaje')
        .join('reserva', 'genera.codigo_reserva', 'reserva.codigo_reserva')
        .leftJoin('boleta', 'genera.codigo_boleta', 'boleta.codigo_boleta')
        .where('reserva.codigo_reserva', codigo_reserva)
        .whereNull('viaje.deleted_at_viaje')
        .first();
    } catch (error) {
      console.error('Error in findWithBookingRef:', {
        error,
        codigo_reserva,
        query: this.db(this.tableName).toString()
      });
      throw new Error(`Error finding trip with booking ref: ${error.message}`);
    }
  }
}

export default TripRepository;