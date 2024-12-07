import { BaseRepository } from "../core/BaseRepository.js";
import { HistoryModel } from "../models/HistoryModel.js";

export class HistoryRepository extends BaseRepository {
  constructor() {
    super("historial", HistoryModel, "id_historial");
  }

  /**
   * Create new history entry
   * @param {Object} historyData - History data
   * @returns {Promise<Object>} Created history entry
   */
  async create(historyData) {
    try {
      const [created] = await this.db(this.tableName)
        .insert(historyData)
        .returning("*");
      return HistoryModel.fromDB(created);
    } catch (error) {
      throw new Error(`Error creating history entry: ${error.message}`);
    }
  }

  /**
   * Update history entry
   * @param {number} id_historial - History ID
   * @param {Object} updateData - Updated history data
   * @returns {Promise<Object|null>} Updated history entry or null
   */
  async update(id_historial, updateData) {
    try {
      const [updated] = await this.db(this.tableName)
        .where({ id_historial })
        .update(updateData)
        .returning("*");
      return updated ? HistoryModel.fromDB(updated) : null;
    } catch (error) {
      throw new Error(`Error updating history entry: ${error.message}`);
    }
  }

  /**
   * Soft delete history entry
   * @param {number} id_historial - History ID
   * @returns {Promise<Object|null>} Deleted history entry or null
   */
  async softDelete(id_historial) {
    try {
      const [deleted] = await this.db(this.tableName)
        .where({ id_historial })
        .update({
          estado_historial: "ELIMINADO",
          deleted_at: new Date(),
        })
        .returning("*");
      return deleted ? HistoryModel.fromDB(deleted) : null;
    } catch (error) {
      throw new Error(`Error soft deleting history entry: ${error.message}`);
    }
  }

  /**
   * Find history entries by reservation
   * @param {number} codigo_reserva - Reservation ID
   * @returns {Promise<Array>} History entries for the reservation
   */
  async findByReservation(codigo_reserva) {
    try {
      const results = await this.db(this.tableName)
        .select("*")
        .where("codigo_reserva", codigo_reserva)
        .orderBy("fecha_cambio", "desc");

      return results.map(result => HistoryModel.fromDB(result));
    } catch (error) {
      throw new Error(`Error finding history by reservation: ${error.message}`);
    }
  }

  /**
   * Find history entries by status
   * @param {string} estado_historial - History status
   * @returns {Promise<Array>} Filtered history entries
   */
  async findByStatus(estado_historial) {
    try {
      const results = await this.db(this.tableName)
        .select("*")
        .where("estado_historial", estado_historial)
        .orderBy("fecha_cambio", "desc");

      return results.map(result => HistoryModel.fromDB(result));
    } catch (error) {
      throw new Error(`Error finding history by status: ${error.message}`);
    }
  }

  /**
   * Find history entries by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Filtered history entries
   */
  async findByDateRange(startDate, endDate) {
    try {
      const results = await this.db(this.tableName)
        .select("*")
        .whereBetween("fecha_cambio", [startDate, endDate])
        .orderBy("fecha_cambio", "desc");

      return results.map(result => HistoryModel.fromDB(result));
    } catch (error) {
      throw new Error(`Error finding history by date range: ${error.message}`);
    }
  }

  /**
   * Find history entry with full details
   * @param {number} id_historial - History ID
   * @returns {Promise<HistoryModel|null>} History entry with details or null
   */
  async findWithDetails(id_historial) {
    try {
      const result = await this.db(this.tableName)
        .select(
          "historial.*",
          "reserva.estado_reserva",
          "reserva.fecha_reserva"
        )
        .leftJoin("reserva", "historial.codigo_reserva", "reserva.codigo_reserva")
        .where("historial.id_historial", id_historial)
        .first();

      return result ? HistoryModel.fromDB(result) : null;
    } catch (error) {
      throw new Error(`Error finding history with details: ${error.message}`);
    }
  }
}

export default HistoryRepository;