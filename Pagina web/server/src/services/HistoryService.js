import { BaseService } from '../core/BaseService.js';
import HistoryRepository from '../repository/HistoryRepository.js';
import { HistoryModel } from '../models/HistoryModel.js';

/**
 * Service class for managing booking history
 * @extends {BaseService}
 */
export class HistoryService extends BaseService {
    /**
     * Creates an instance of HistoryService
     */
    constructor() {
        const historyRepository = new HistoryRepository();
        super(historyRepository);
    }

    /**
     * Creates a new history entry
     * @param {Object} historyData - History entry data
     * @param {string} historyData.estado_historial - Status of the history entry
     * @param {string} [historyData.observacion_historial] - Observations or description
     * @param {string} historyData.accion - Action performed
     * @param {number} historyData.codigo_reserva - Related booking code
     * @returns {Promise<Object>} Created history entry
     * @throws {Error} If creation fails
     */
    async createHistoryEntry(historyData) {
        try {
            return await this.repository.create({
                estado_historial: historyData.estado_historial,
                observacion_historial: historyData.observacion_historial || '',
                accion: historyData.accion,
                codigo_reserva: historyData.codigo_reserva,
                fecha_cambio: new Date()
            });
        } catch (error) {
            console.error('Error creating history entry:', error);
            throw new Error(`Error al crear entrada de historial: ${error.message}`);
        }
    }

    /**
     * Creates a history entry within a transaction
     * @param {Object} trx - Knex transaction object
     * @param {string} accion - Action performed
     * @param {Object} [additionalData] - Additional data for the history entry
     * @param {string} [additionalData.observacion_historial] - Observations
     * @param {number} [additionalData.codigo_reserva] - Related booking code
     * @returns {Promise<HistoryModel>} Created history entry model
     * @throws {Error} If creation fails
     */
    async createHistoryEntryWithTransaction(trx, accion, codigo_reserva, additionalData = {}) {
        if (!trx) {
            throw new Error('Transaction object is required');
        }

        try {
            const historyData = {
                estado_historial: 'RESERVA_EN_REVISION',
                observacion_historial: additionalData.observacion_historial || '',
                accion: accion,
                codigo_reserva: codigo_reserva,
                fecha_cambio: new Date()
            };

            // Create and validate model - single instance
            const historyModel = new HistoryModel(historyData);
            
            // Save to database using the provided transaction
            const rawHistory = await this.repository.create(historyModel.toJSON(), trx);
            
            // Update the existing model with the saved data (including ID and timestamps)
            historyModel.update(rawHistory);
            
            return historyModel;
        } catch (error) {
            console.error('Error creating history entry with transaction:', error);
            throw new Error(`Error al crear entrada de historial con transacción: ${error.message}`);
        }
    }

    /**
     * Gets history entries for a booking
     * @param {number} codigo_reserva - Booking code
     * @returns {Promise<Array>} History entries for the booking
     */
    async getBookingHistory(codigo_reserva) {
        try {
            return await this.repository.findByBookingCode(codigo_reserva);
        } catch (error) {
            console.error('Error getting booking history:', error);
            throw new Error(`Error al obtener historial de reserva: ${error.message}`);
        }
    }

    /**
     * Gets history entries by state
     * @param {string} estado - History state to filter by
     * @returns {Promise<Array>} Filtered history entries
     */
    async getHistoryByState(estado) {
        try {
            return await this.repository.findByState(estado);
        } catch (error) {
            console.error('Error getting history by state:', error);
            throw new Error(`Error al obtener historial por estado: ${error.message}`);
        }
    }

    /**
     * Gets history entries within a date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<Array>} History entries within range
     */
    async getHistoryByDateRange(startDate, endDate) {
        try {
            return await this.repository.findByDateRange(startDate, endDate);
        } catch (error) {
            console.error('Error getting history by date range:', error);
            throw new Error(`Error al obtener historial por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Gets history entries by action type
     * @param {string} accion - Action type to filter by
     * @returns {Promise<Array>} Filtered history entries
     */
    async getHistoryByAction(accion) {
        try {
            return await this.repository.findByAction(accion);
        } catch (error) {
            console.error('Error getting history by action:', error);
            throw new Error(`Error al obtener historial por acción: ${error.message}`);
        }
    }

    /**
     * Gets detailed history entry with booking information
     * @param {number} historyId - History entry ID
     * @returns {Promise<Object|null>} History entry with booking details
     */
    async getHistoryWithBookingDetails(historyId) {
        try {
            return await this.repository.findWithBookingDetails(historyId);
        } catch (error) {
            console.error('Error getting history with booking details:', error);
            throw new Error(`Error al obtener historial con detalles de reserva: ${error.message}`);
        }
    }
}

export default HistoryService; 