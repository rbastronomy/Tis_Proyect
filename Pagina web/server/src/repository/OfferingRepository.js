import { BaseRepository } from '../core/BaseRepository.js';
import { OfferingModel } from '../models/OfferingModel.js';
import { RateModel } from '../models/RateModel.js';

export class OfferingRepository extends BaseRepository {
    constructor() {
        super('oferta', OfferingModel, 'id_oferta');
    }

    /**
     * Find offering by its ID
     * @param {number} id_oferta - Offering ID
     * @returns {Promise<Object|null>} Found offering or null
     */
    async findById(id_oferta) {
        try {
            const result = await this.db(this.tableName)
                .select(
                    'oferta.id_oferta',
                    'oferta.codigo_servicio',
                    'oferta.id_tarifa'
                )
                .where('oferta.id_oferta', id_oferta)
                .first();

            return result || null;
        } catch (error) {
            throw new Error(`Error in findById: ${error.message}`);
        }
    }

    /**
     * Find all offerings for a specific service
     * @param {number} codigo_servicio - Service ID
     * @returns {Promise<Array>} List of offerings with their tariffs
     */
    async findByService(codigo_servicio) {
        const results = await this.db(this.tableName)
            .select(
                'oferta.*',
                'tarifa.id',
                'tarifa.tipo',
                'tarifa.descripciont',
                'tarifa.precio',
                'tarifa.estadot',
                'tarifa.fcreada',
                'tarifa.deletedatt'
            )
            .join('tarifa', 'oferta.id_tarifa', 'tarifa.id_tarifa')
            .join('servicio', 'oferta.codigo_servicio', 'servicio.codigo_servicio')
            .where({
                'oferta.codigo_servicio': codigo_servicio,
                'tarifa.estado_tarifa': 'ACTIVO',
                'servicio.estado_servicio': 'ACTIVO'
            })
            .whereNull('tarifa.deleted_at_tarifa');

        return results.map(result => this._toModel({
            ...result,
            rate: RateModel.fromDB({
                id: result.id,
                tipo: result.tipo,
                descripciont: result.descripciont,
                precio: result.precio,
                estadot: result.estadot,
                fcreada: result.fcreada,
                deletedatt: result.deletedatt
            })
        }));
    }

    /**
     * Find offerings by ride type
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of offerings filtered by ride type
     */
    async findByRideType(rideType) {
        const query = this.db(this.tableName)
            .select('oferta.*')
            .join('tarifa', 'oferta.id_tarifa', 'tarifa.id_tarifa')
            .where({
                'tarifa.estado_tarifa': 'ACTIVO'
            })
            .whereNull('tarifa.delete_at_tarifa');

        if (rideType === 'CITY') {
            query.where('tarifa.tipo_tarifa', 'TRASLADO_CIUDAD');
        } else if (rideType === 'AIRPORT') {
            query.whereNot('tarifa.tipo_tarifa', 'TRASLADO_CIUDAD');
        }

        const results = await query;
        return results;
    }

    /**
     * Find offerings for a specific service filtered by ride type
     * @param {number} codigo_servicio - Service ID
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of filtered offerings
     */
    async findByServiceAndType(codigo_servicio, rideType) {
        const query = this.db(this.tableName)
            .select(
                'oferta.*',
                'tarifa.id_tarifa as id',
                'tarifa.tipo_tarifa as tipo',
                'tarifa.descripcion_tarifa as descripciont',
                'tarifa.precio',
                'tarifa.estado_tarifa as estadot',
                'tarifa.created_at as fcreada',
                'tarifa.delete_at_tarifa as deletedatt'
            )
            .join('tarifa', 'oferta.id_tarifa', 'tarifa.id_tarifa')
            .where('tarifa.estado_tarifa', 'ACTIVO')
            .whereNull('tarifa.delete_at_tarifa');

        if (rideType === 'CITY') {
            query.where('tarifa.tipo_tarifa', 'TRASLADO_CIUDAD');
        } else if (rideType === 'AIRPORT') {
            query.whereNot('tarifa.tipo_tarifa', 'TRASLADO_CIUDAD');
        }

        const results = await query;

        return results.map(result => this._toModel({
            ...result,
            rate: RateModel.fromDB({
                id: result.id,
                tipo: result.tipo,
                descripciont: result.descripciont,
                precio: result.precio,
                estadot: result.estadot,
                fcreada: result.fcreada,
                deletedatt: result.deletedatt
            })
        }));
    }

    /**
     * Create a new offering
     * @param {Object} data - Offering data
     * @returns {Promise<Object>} Created offering
     */
    async create(data) {
        const [id] = await this.db(this.tableName).insert(data);
        return this.findById(id);
    }

    /**
     * Update an existing offering
     * @param {number} id - Offering ID
     * @param {Object} data - Updated offering data
     * @returns {Promise<Object>} Updated offering
     */
    async update(id, data) {
        await this.db(this.tableName)
            .where({ [this.primaryKey]: id })
            .update(data);
        return this.findById(id);
    }

    /**
     * Delete an offering
     * @param {number} id - Offering ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        await this.db(this.tableName)
            .where({ [this.primaryKey]: id })
            .del();
    }

    /**
     * Find a single offering ID by criteria
     * @param {Object} criteria - Search criteria
     * @param {number} [criteria.codigo_servicio] - Service ID
     * @param {number} [criteria.id_tarifa] - Rate ID
     * @returns {Promise<number|null>} Found offering ID or null
     */
    async findOne(criteria) {
        try {
            const result = await this.db(this.tableName)
                .select('id_oferta')
                .where(criteria)
                .first();

            return result ? result.id_oferta : null;
        } catch (error) {
            throw new Error(`Error in findOne: ${error.message}`);
        }
    }
} 