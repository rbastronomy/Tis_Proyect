import { BaseService } from '../core/BaseService.js';
import { HistoryModel } from '../models/HistoryModel.js';
import { HistoryRepository } from '../repository/HistoryRepository.js';

export class HistoryService extends BaseService {
    constructor() {
        const historyModel = new HistoryModel();
        super(historyModel);
        this.repository = new HistoryRepository();
    }

    /**
     * Encuentra el historial por ID de usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Array>} Lista de registros del historial
     * @throws {Error} Si hay un error al recuperar el historial
     */
    async findByUserId(userId) {
        try {
            return await this.repository.findByUserId(userId);
        } catch (error) {
            throw new Error(`Error al recuperar historial del usuario: ${error.message}`);
        }
    }

    /**
     * Encuentra el historial por ID de servicio
     * @param {number} serviceId - ID del servicio
     * @returns {Promise<Array>} Lista de registros del historial
     * @throws {Error} Si hay un error al recuperar el historial
     */
    async findByServiceId(serviceId) {
        try {
            return await this.repository.findByServiceId(serviceId);
        } catch (error) {
            throw new Error(`Error al recuperar historial del servicio: ${error.message}`);
        }
    }

    /**
     * Crea un nuevo registro en el historial
     * @param {Object} data - Datos del historial
     * @param {number} data.usuario_id - ID del usuario
     * @param {number} data.servicio_id - ID del servicio
     * @param {string} data.tipo_cambio - Tipo de cambio realizado
     * @param {string} data.descripcion - Descripción del cambio
     * @returns {Promise<Object>} Registro creado
     * @throws {Error} Si hay un error al crear el registro
     */
    async create(data) {
        try {
            const historyEntry = await this.repository.create({
                ...data,
                fecha: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            });
            return historyEntry;
        } catch (error) {
            throw new Error(`Error al crear registro en historial: ${error.message}`);
        }
    }

    /**
     * Encuentra el historial por rango de fechas
     * @param {Date} startDate - Fecha inicial
     * @param {Date} endDate - Fecha final
     * @returns {Promise<Array>} Lista de registros del historial
     * @throws {Error} Si hay un error al recuperar el historial
     */
    async findByDateRange(startDate, endDate) {
        try {
            return await this.repository.findByDateRange(startDate, endDate);
        } catch (error) {
            throw new Error(`Error al recuperar historial por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Encuentra el historial por tipo de cambio
     * @param {string} changeType - Tipo de cambio
     * @returns {Promise<Array>} Lista de registros del historial
     * @throws {Error} Si hay un error al recuperar el historial
     */
    async findByChangeType(changeType) {
        try {
            return await this.repository.findByChangeType(changeType);
        } catch (error) {
            throw new Error(`Error al recuperar historial por tipo de cambio: ${error.message}`);
        }
    }

    /**
     * Obtiene el historial paginado
     * @param {number} page - Número de página
     * @param {number} limit - Límite de registros por página
     * @param {Object} filters - Filtros adicionales
     * @returns {Promise<Object>} Objeto con registros y metadata de paginación
     * @throws {Error} Si hay un error al recuperar el historial
     */
    async getPaginated(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            const records = await this.repository.findPaginated(offset, limit, filters);
            const total = await this.repository.count(filters);

            return {
                records,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error al recuperar historial paginado: ${error.message}`);
        }
    }

    /**
     * Obtiene resumen de cambios por período
     * @param {string} period - Período ('day', 'week', 'month', 'year')
     * @returns {Promise<Array>} Resumen de cambios agrupados por período
     * @throws {Error} Si hay un error al generar el resumen
     */
    async getChangesSummary(period) {
        try {
            return await this.repository.getChangesSummary(period);
        } catch (error) {
            throw new Error(`Error al generar resumen de cambios: ${error.message}`);
        }
    }
} 