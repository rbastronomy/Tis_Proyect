import { BaseRepository } from "../core/BaseRepository.js";

/**
 * Repository class for booking history
 * @extends {BaseRepository}
 */
export class HistoryRepository extends BaseRepository {
  /**
   * Creates an instance of HistoryRepository
   */
  constructor() {
    super("historial");
  }

  /**
   * Creates a history entry within a transaction
   * @param {Object} historyData - History data to create
   * @param {Object} trx - Knex transaction object
   * @returns {Promise<Object>} Created history entry raw data
   */
  async create(historyData, trx = null) {
    const query = (trx || this.knex)(this.tableName)
      .insert({
        estado_historial: historyData.estado_historial,
        observacion_historial: historyData.observacion_historial,
        fecha_cambio: historyData.fecha_cambio,
        accion: historyData.accion,
        codigo_reserva: historyData.codigo_reserva
      })
      .returning("*");

    const [history] = await query;
    return history;
  }

  /**
   * Finds history entries by booking code
   * @param {string} codigo_reserva - Booking code
   * @returns {Promise<Array>} History entries
   */
  async findByBookingCode(codigo_reserva) {
    return this.knex(this.tableName)
      .where({ codigo_reserva })
      .orderBy("fecha_cambio", "desc");
  }

  /**
   * Finds history entries by state
   * @param {string} estado_historial - History state
   * @returns {Promise<Array>} History entries
   */
  async findByState(estado_historial) {
    return this.knex(this.tableName)
      .where({ estado_historial })
      .orderBy("fecha_cambio", "desc");
  }

  /**
   * Finds history entries by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} History entries
   */
  async findByDateRange(startDate, endDate) {
    return this.knex(this.tableName)
      .whereBetween("fecha_cambio", [startDate, endDate])
      .orderBy("fecha_cambio", "desc");
  }

  /**
   * Finds history entries by action type
   * @param {string} accion - Action type
   * @returns {Promise<Array>} History entries
   */
  async findByAction(accion) {
    return this.knex(this.tableName)
      .where({ accion })
      .orderBy("fecha_cambio", "desc");
  }

  /**
   * Gets history entry with booking details
   * @param {number} id_historial - History ID
   * @returns {Promise<Object|null>} History entry with booking details
   */
  async findWithBookingDetails(id_historial) {
    return this.knex(this.tableName)
      .select(
        'historial.*',
        'reserva.estados as estado_reserva',
        'reserva.freserva as fecha_reserva'
      )
      .leftJoin('reserva', 'historial.codigo_reserva', 'reserva.codigo_reserva')
      .where('historial.id_historial', id_historial)
      .first();
  }
}

export default HistoryRepository;