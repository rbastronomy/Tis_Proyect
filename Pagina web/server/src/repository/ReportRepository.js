import { BaseRepository } from '../core/BaseRepository.js';

/**
 * Repositorio para generar reportes basados en datos de múltiples tablas
 * @extends {BaseRepository}
 */
export class ReportRepository extends BaseRepository {
    /**
     * Inicializa el repositorio de reportes
     */
    constructor() {
        // No necesitamos una tabla específica ya que trabajamos con múltiples tablas
        super(null);
    }

    /**
     * Obtiene estadísticas de reservas agrupadas por taxi
     * @param {Object} filters - Filtros para el reporte
     * @param {Date} [filters.startDate] - Fecha inicial
     * @param {Date} [filters.endDate] - Fecha final
     * @returns {Promise<Array>} Datos del reporte
     * @throws {DatabaseError} Si hay un error en la consulta
     */
    async getBookingsByTaxi(filters) {
        try {
            const dateFilter = this._createDateFilter(filters, 'r.fecha_reserva');
            
            const query = `
                SELECT 
                    t.patente,
                    t.marca,
                    t.modelo,
                    t.ano,
                    COUNT(r.codigo_reserva) as total_reservas,
                    COUNT(CASE WHEN r.estado_reserva = 'COMPLETADA' THEN 1 END) as reservas_completadas,
                    COUNT(CASE WHEN r.estado_reserva = 'CANCELADA' THEN 1 END) as reservas_canceladas,
                    COUNT(CASE WHEN r.estado_reserva = 'PENDIENTE' THEN 1 END) as reservas_pendientes
                FROM taxi t
                LEFT JOIN reserva r ON t.patente = r.patente_taxi
                WHERE t.deleted_at_taxi IS NULL
                ${dateFilter}
                GROUP BY t.patente, t.marca, t.modelo, t.ano
                ORDER BY total_reservas DESC
            `;

            return await this.query(query);
        } catch (error) {
            throw new DatabaseError('Error al obtener reporte de reservas por taxi', error);
        }
    }

    /**
     * Obtiene estadísticas de reservas agrupadas por cliente
     * @param {Object} filters - Filtros para el reporte
     * @param {Date} [filters.startDate] - Fecha inicial
     * @param {Date} [filters.endDate] - Fecha final
     * @returns {Promise<Array>} Datos del reporte
     * @throws {DatabaseError} Si hay un error en la consulta
     */
    async getBookingsByClient(filters) {
        try {
            const dateFilter = this._createDateFilter(filters, 'r.fecha_reserva');

            const query = `
                SELECT 
                    p.rut,
                    p.nombre,
                    p.apellido_paterno,
                    p.apellido_materno,
                    p.correo,
                    COUNT(r.codigo_reserva) as total_reservas,
                    COUNT(CASE WHEN r.estado_reserva = 'COMPLETADA' THEN 1 END) as reservas_completadas,
                    COUNT(CASE WHEN r.estado_reserva = 'CANCELADA' THEN 1 END) as reservas_canceladas,
                    COUNT(CASE WHEN r.estado_reserva = 'PENDIENTE' THEN 1 END) as reservas_pendientes
                FROM persona p
                LEFT JOIN reserva r ON p.rut = r.rut_cliente
                WHERE p.deleted_at_persona IS NULL 
                AND p.id_roles = 2 -- Solo clientes
                ${dateFilter}
                GROUP BY p.rut, p.nombre, p.apellido_paterno, p.apellido_materno, p.correo
                ORDER BY total_reservas DESC
            `;

            return await this.query(query);
        } catch (error) {
            throw new DatabaseError('Error al obtener reporte de reservas por cliente', error);
        }
    }

    /**
     * Obtiene estadísticas de viajes realizados por cada taxi
     * @param {Object} filters - Filtros para el reporte
     * @param {Date} [filters.startDate] - Fecha inicial
     * @param {Date} [filters.endDate] - Fecha final
     * @returns {Promise<Array>} Datos del reporte
     * @throws {DatabaseError} Si hay un error en la consulta
     */
    async getTripsByTaxi(filters) {
        try {
            const dateFilter = this._createDateFilter(filters, 'v.fecha_viaje');

            const query = `
                SELECT 
                    t.patente,
                    t.marca,
                    t.modelo,
                    t.ano,
                    COUNT(v.codigo_viaje) as total_viajes,
                    ROUND(AVG(v.calificacion)::numeric, 2) as calificacion_promedio,
                    ROUND(SUM(v.distancia_km)::numeric, 2) as total_kilometros,
                    ROUND(AVG(v.duracion)::numeric, 2) as duracion_promedio_minutos
                FROM taxi t
                LEFT JOIN reserva r ON t.patente = r.patente_taxi
                LEFT JOIN viaje v ON r.codigo_reserva = v.codigo_reserva
                WHERE t.deleted_at_taxi IS NULL
                ${dateFilter}
                GROUP BY t.patente, t.marca, t.modelo, t.ano
                ORDER BY total_viajes DESC
            `;

            return await this.query(query);
        } catch (error) {
            throw new DatabaseError('Error al obtener reporte de viajes por taxi', error);
        }
    }

    /**
     * Obtiene estadísticas de ingresos generados por cada taxi
     * @param {Object} filters - Filtros para el reporte
     * @param {Date} [filters.startDate] - Fecha inicial
     * @param {Date} [filters.endDate] - Fecha final
     * @returns {Promise<Array>} Datos del reporte
     * @throws {DatabaseError} Si hay un error en la consulta
     */
    async getIncomeByTaxi(filters) {
        try {
            const dateFilter = this._createDateFilter(filters, 'v.fecha_viaje');

            const query = `
                SELECT 
                    t.patente,
                    t.marca,
                    t.modelo,
                    COUNT(v.codigo_viaje) as total_viajes,
                    ROUND(SUM(b.total)::numeric, 2) as ingreso_total,
                    ROUND(AVG(b.total)::numeric, 2) as ingreso_promedio_por_viaje,
                    COUNT(DISTINCT r.rut_conductor) as total_conductores
                FROM taxi t
                LEFT JOIN reserva r ON t.patente = r.patente_taxi
                LEFT JOIN viaje v ON r.codigo_reserva = v.codigo_reserva
                LEFT JOIN boleta b ON v.codigo_viaje = b.codigo_viaje
                WHERE t.deleted_at_taxi IS NULL
                ${dateFilter}
                GROUP BY t.patente, t.marca, t.modelo
                ORDER BY ingreso_total DESC NULLS LAST
            `;

            return await this.query(query);
        } catch (error) {
            throw new DatabaseError('Error al obtener reporte de ingresos por taxi', error);
        }
    }

    /**
     * Crea la cláusula WHERE para filtrar por fecha
     * @private
     * @param {Object} filters - Filtros con fechas
     * @param {Date} [filters.startDate] - Fecha inicial
     * @param {Date} [filters.endDate] - Fecha final
     * @param {string} dateField - Campo de fecha en la consulta
     * @returns {string} Cláusula WHERE para el filtro de fechas
     */
    _createDateFilter(filters, dateField) {
        if (filters.startDate && filters.endDate) {
            return `AND ${dateField} BETWEEN '${filters.startDate.toISOString()}' AND '${filters.endDate.toISOString()}'`;
        }
        return '';
    }
}