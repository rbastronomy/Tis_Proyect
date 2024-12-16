import { ReportModel } from '../models/ReportModel.js';
import { ReportRepository } from '../repository/ReportRepository.js';

/**
 * Servicio para manejar la generación de reportes
 */
export class ReportService {
    /**
     * @param {ReportRepository} repository - Repositorio de reportes
     */
    constructor() {
        this.reportRepository = new ReportRepository();
    }

    /**
     * Verifica si un usuario tiene permisos para generar reportes
     * @private
     * @param {UserModel} user - Usuario actual
     * @throws {Error} Si el usuario no tiene permisos
     */
    _verifyPermissions(user) {
        if (!user || !user.role || user.role.nombre_rol !== 'ADMINISTRADOR') {
            throw new Error('No tienes permisos para generar reportes');
        }
    }

    /**
     * Procesa los filtros de fecha para el reporte
     * @private
     * @param {Object} filters - Filtros del reporte
     * @returns {Object} Filtros procesados
     */
    _processDateFilters(filters) {
        if (filters.fecha_between) {
            const [startDate, endDate] = filters.fecha_between;
            return {
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            };
        }
        return {};
    }

    /**
     * Genera un reporte basado en los parámetros proporcionados
     * @param {Object} params - Parámetros del reporte
     * @param {string} params.type - Tipo de reporte (BOOKINGS_BY_TAXI, BOOKINGS_BY_CLIENT, etc)
     * @param {Object} params.filters - Filtros adicionales (fechas, etc)
     * @param {UserModel} params.user - Usuario que solicita el reporte
     * @returns {Promise<ReportModel>} Modelo del reporte generado
     * @throws {Error} Si el tipo de reporte no es soportado o hay un error en la generación
     */
    async generateReport({ type, filters = {}, user }) {
        // Verificar permisos
        this._verifyPermissions(user);

        // Procesar filtros
        const processedFilters = this._processDateFilters(filters);

        // Obtener datos según el tipo de reporte
        let reportData;
        try {
            switch (type) {
                case ReportModel.REPORT_TYPES.BOOKINGS_BY_TAXI:
                    reportData = await this.reportRepository.getBookingsByTaxi(processedFilters);
                    break;
                case ReportModel.REPORT_TYPES.BOOKINGS_BY_CLIENT:
                    reportData = await this.reportRepository.getBookingsByClient(processedFilters);
                    break;
                case ReportModel.REPORT_TYPES.TRIPS_BY_TAXI:
                    reportData = await this.reportRepository.getTripsByTaxi(processedFilters);
                    break;
                case ReportModel.REPORT_TYPES.INCOME_BY_TAXI:
                    reportData = await this.reportRepository.getIncomeByTaxi(processedFilters);
                    break;
                default:
                    throw new Error(`Tipo de reporte no soportado: ${type}`);
            }

            // Crear y retornar el modelo de reporte
            return new ReportModel({
                type,
                data: reportData,
                generatedAt: new Date(),
                generatedBy: user.id,
                filters: processedFilters
            });

        } catch (error) {
            throw new Error(`Error al generar reporte: ${error.message}`);
        }
    }
}