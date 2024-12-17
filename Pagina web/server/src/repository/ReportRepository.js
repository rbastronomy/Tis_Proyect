import { BaseRepository } from '../core/BaseRepository.js';

/**
 * Repository for generating reports from database
 * @extends {BaseRepository}
 */
export class ReportRepository extends BaseRepository {
    constructor() {
        super(null); // No specific table as we'll be joining multiple tables
    }

    /**
     * Get trips statistics grouped by taxi
     * @param {Object} filters - Date filters
     * @param {Date} [filters.startDate] - Start date
     * @param {Date} [filters.endDate] - End date
     * @returns {Promise<Array>} Array of taxi trip statistics
     */
    async getTripsByTaxi(filters = {}) {
        try {
            let query = this.db('taxi as t')
                .select(
                    't.patente',
                    't.marca',
                    't.modelo',
                    't.ano',
                    this.db.raw('COUNT(DISTINCT v.codigo_viaje) as total_viajes'),
                    this.db.raw('COALESCE(ROUND(AVG(v.duracion)::numeric, 2), 0) as duracion_promedio'),
                    this.db.raw('COUNT(DISTINCT r.rut_conductor) as total_conductores'),
                    this.db.raw('COALESCE(ROUND(AVG(b.total)::numeric, 2), 0) as ingreso_promedio_por_viaje')
                )
                .leftJoin('reserva as r', 'r.patente_taxi', 't.patente')
                .leftJoin('genera as g', 'g.codigo_reserva', 'r.codigo_reserva')
                .leftJoin('viaje as v', 'v.codigo_viaje', 'g.codigo_viaje')
                .leftJoin('boleta as b', 'g.codigo_boleta', 'b.codigo_boleta')
                .whereNull('t.deleted_at_taxi')
                .whereNull('v.deleted_at_viaje')
                .whereNull('b.deleted_at_boleta');

            if (filters.startDate && filters.endDate) {
                query = query.whereBetween('v.fecha_viaje', [filters.startDate, filters.endDate]);
            }

            return await query
                .groupBy('t.patente', 't.marca', 't.modelo', 't.ano')
                .orderBy('total_viajes', 'desc');

        } catch (error) {
            console.error('Error in getTripsByTaxi:', error);
            throw new Error(`Error getting trips by taxi: ${error.message}`);
        }
    }

    /**
     * Get monthly income statistics grouped by driver
     * @param {Object} filters - Date filters
     * @param {Date} [filters.startDate] - Start date
     * @param {Date} [filters.endDate] - End date
     * @returns {Promise<Array>} Array of driver monthly income statistics
     */
    async getMonthlyIncomeByDriver(filters = {}) {
        try {
            let query = this.db('persona as p')
                .select(
                    'p.rut',
                    'p.nombre',
                    'p.apellido_paterno',
                    this.db.raw("DATE_TRUNC('month', v.fecha_viaje) as mes"),
                    this.db.raw('COUNT(DISTINCT v.codigo_viaje) as total_viajes'),
                    this.db.raw('COALESCE(SUM(b.total), 0) as ingreso_total'),
                    this.db.raw('COUNT(DISTINCT t.patente) as total_taxis_conducidos')
                )
                .join('reserva as r', 'r.rut_conductor', 'p.rut')
                .join('genera as g', 'g.codigo_reserva', 'r.codigo_reserva')
                .join('viaje as v', 'v.codigo_viaje', 'g.codigo_viaje')
                .join('boleta as b', 'g.codigo_boleta', 'b.codigo_boleta')
                .leftJoin('taxi as t', 'r.patente_taxi', 't.patente')
                .where('p.id_roles', 3) // Assuming 3 is the driver role ID
                .whereNull('p.deleted_at_persona')
                .whereNull('v.deleted_at_viaje')
                .whereNull('b.deleted_at_boleta');

            if (filters.startDate && filters.endDate) {
                query = query.whereBetween('v.fecha_viaje', [filters.startDate, filters.endDate]);
            }

            return await query
                .groupBy(
                    'p.rut',
                    'p.nombre',
                    'p.apellido_paterno',
                    this.db.raw("DATE_TRUNC('month', v.fecha_viaje)")
                )
                .orderBy([
                    { column: 'p.rut' },
                    { column: this.db.raw("DATE_TRUNC('month', v.fecha_viaje)") }
                ]);

        } catch (error) {
            console.error('Error in getMonthlyIncomeByDriver:', error);
            throw new Error(`Error getting monthly income by driver: ${error.message}`);
        }
    }
}