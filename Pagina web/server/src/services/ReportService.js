import { ReportModel } from '../models/ReportModel.js';
import { ReportRepository } from '../repository/ReportRepository.js';
import { UserModel } from '../models/UserModel.js';

/**
 * Service for handling report generation
 */
export class ReportService {
    /**
     * Initialize report service
     */
    constructor() {
        this.reportRepository = new ReportRepository();
    }

    /**
     * Verify user permissions for report generation
     * @private
     * @param {import('../models/UserModel.js').UserModel} user - Current user
     * @throws {Error} If user lacks permissions
     */
    _verifyPermissions(user) {
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        // Check if user has ADMINISTRADOR role using UserModel's hasRoles method
        if (user.hasRoles(['ADMINISTRADOR'])) {
            return; // Admin has permission, exit check
        }

        // For non-admin users, check specific permissions
        if (user.hasPermissions(['generate_reports'])) {
            return; // User has specific permission
        }

        throw new Error('No tienes permisos para generar reportes');
    }

    /**
     * Process date filters for report
     * @private
     * @param {Object} filters - Report filters
     * @returns {Object} Processed date filters
     */
    _processDateFilters(filters) {
        const processedFilters = {};
        
        if (filters.startDate) {
            processedFilters.startDate = new Date(filters.startDate);
        }
        if (filters.endDate) {
            processedFilters.endDate = new Date(filters.endDate);
        }

        // Validate date range if both dates are present
        if (processedFilters.startDate && processedFilters.endDate) {
            if (processedFilters.startDate > processedFilters.endDate) {
                throw new Error('La fecha inicial debe ser anterior a la fecha final');
            }
        }

        return processedFilters;
    }

    /**
     * Format trip statistics for taxi report
     * @private
     * @param {Array} rawData - Raw database results
     * @returns {Array} Formatted trip statistics
     */
    _formatTripsByTaxi(rawData) {
        return rawData.map(row => ({
            patente: row.patente,
            vehiculo: `${row.marca} ${row.modelo} (${row.ano})`,
            total_viajes: parseInt(row.total_viajes),
            duracion_promedio: parseFloat(row.duracion_promedio),
            total_conductores: parseInt(row.total_conductores),
            ingreso_promedio_por_viaje: parseFloat(row.ingreso_promedio_por_viaje)
        }));
    }

    /**
     * Format monthly income statistics for driver report
     * @private
     * @param {Array} rawData - Raw database results
     * @returns {Array} Formatted income statistics
     */
    _formatMonthlyIncomeByDriver(rawData) {
        return rawData.map(row => ({
            rut: row.rut,
            conductor: row.apellido_paterno 
                ? `${row.nombre} ${row.apellido_paterno}`
                : row.nombre,
            mes: new Date(row.mes).toLocaleDateString('es-CL', { 
                year: 'numeric', 
                month: 'long' 
            }),
            total_viajes: parseInt(row.total_viajes),
            ingreso_total: parseFloat(row.ingreso_total),
            total_taxis_conducidos: parseInt(row.total_taxis_conducidos)
        }));
    }

    /**
     * Generate report based on type and filters
     * @param {Object} params - Report parameters
     * @param {string} params.type - Report type
     * @param {Object} params.filters - Report filters
     * @param {Object} params.user - Current user
     * @returns {Promise<ReportModel>} Generated report
     * @throws {Error} If generation fails
     */
    async generateReport({ type, filters = {}, user }) {
        try {
            // Verify permissions
            this._verifyPermissions(user);

            // Process filters
            const processedFilters = this._processDateFilters(filters);

            // Get and format data based on report type
            let reportData;
            switch (type) {
                case ReportModel.REPORT_TYPES.TRIPS_BY_TAXI:
                    const taxiData = await this.reportRepository.getTripsByTaxi(processedFilters);
                    reportData = this._formatTripsByTaxi(taxiData);
                    break;

                case ReportModel.REPORT_TYPES.MONTHLY_INCOME_BY_DRIVER:
                    const driverData = await this.reportRepository.getMonthlyIncomeByDriver(processedFilters);
                    reportData = this._formatMonthlyIncomeByDriver(driverData);
                    break;

                default:
                    throw new Error(`Tipo de reporte no soportado: ${type}`);
            }

            // Create and return report model
            return new ReportModel({
                type,
                data: reportData,
                generatedAt: new Date(),
                generatedBy: user.rut,
                generatedByUser: {
                    nombre: user.nombre,
                    apellido_paterno: user.apellidoPaterno
                },
                filters: processedFilters
            });

        } catch (error) {
            console.error('Error generating report:', error);
            throw new Error(`Error al generar reporte: ${error.message}`);
        }
    }
}