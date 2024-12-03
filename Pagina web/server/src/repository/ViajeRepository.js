import { BaseRepository } from '../core/BaseRepository.js';
import { ViajeModel } from '../models/ViajeModel.js';
import { db } from '../db/database.js';

export class ViajeRepository extends BaseRepository {
  constructor() {
    super('viaje', ViajeModel, 'codigo');
  }

  /**
   * Find viajes by driver RUT
   * @param {number} rutConductor - Driver's RUT
   * @returns {Promise<Array>} Driver's viajes
   */
  async findByDriver(rutConductor) {
    const results = await this.db(this.tableName)
      .select(
        'viaje.*',
        'reserva.origenv',
        'reserva.destinov',
        'reserva.tipo'
      )
      .join('reserva', 'viaje.codigoreserva', 'reserva.codigoreserva')
      .where('reserva.rut_conductor', rutConductor)
      .orderBy('viaje.fechav', 'desc');

    return results.map(result => new this.modelClass(result));
  }

  /**
   * Find viajes by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Filtered viajes
   */
  async findByDateRange(startDate, endDate) {
    const results = await this.db(this.tableName)
      .select(
        'viaje.*',
        'reserva.origenv',
        'reserva.destinov',
        'reserva.tipo',
        'persona.nombre as conductor_nombre',
        'persona.apellido as conductor_apellido'
      )
      .join('reserva', 'viaje.codigoreserva', 'reserva.codigoreserva')
      .join('persona', 'reserva.rut_conductor', 'persona.rut')
      .whereBetween('viaje.fechav', [startDate, endDate])
      .orderBy('viaje.fechav', 'desc');

    return results.map(result => new this.modelClass(result));
  }

  /**
   * Find viaje with full details
   * @param {number} codigoviaje - Viaje ID
   * @returns {Promise<ViajeModel|null>} Viaje with full details
   */
  async findWithDetails(codigoviaje) {
    const result = await this.db(this.tableName)
      .select(
        'viaje.*',
        'reserva.origenv',
        'reserva.destinov',
        'reserva.tipo',
        'reserva.observacion as reserva_observacion',
        'persona.nombre as conductor_nombre',
        'persona.apellido as conductor_apellido',
        'taxi.modelo as taxi_modelo',
        'taxi.ano as taxi_ano',
        'taxi.patente'
      )
      .join('reserva', 'viaje.codigoreserva', 'reserva.codigoreserva')
      .join('persona', 'reserva.rut_conductor', 'persona.rut')
      .join('taxi', 'reserva.patente_taxi', 'taxi.patente')
      .where('viaje.codigoviaje', codigoviaje)
      .first();

    return result ? new this.modelClass(result) : null;
  }

  /**
   * Find all completed viajes for a reserva
   * @param {number} codigoreserva - Reserva ID
   * @returns {Promise<Array>} Completed viajes
   */
  async findByReserva(codigoreserva) {
    const results = await this.db(this.tableName)
      .select('*')
      .where('codigoreserva', codigoreserva)
      .orderBy('fechav', 'desc');

    return results.map(result => new this.modelClass(result));
  }
} 