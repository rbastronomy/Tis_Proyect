import { BaseRepository } from '../core/BaseRepository.js';
import { OfferingModel } from '../models/OfferingModel.js';
import { RateModel } from '../models/TarifaModel.js';

export class OfferingRepository extends BaseRepository {
    constructor() {
        super('oferta', OfferingModel, 'oferta_id');
    }

    /**
     * Find all offerings for a specific service
     * @param {number} codigos - Service ID
     * @returns {Promise<Array>} List of offerings with their tariffs
     */
    async findByService(codigos) {
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
            .join('tarifa', 'oferta.idtarifa', 'tarifa.id_tarifa')
            .join('servicio', 'oferta.codigos', 'servicio.codigos')
            .where({
                'oferta.codigos': codigos,
                'tarifa.estadot': 'ACTIVO',
                'servicio.estados': 'ACTIVO'
            })
            .whereNull('tarifa.deletedatt');

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
            .select(
                'oferta.*',
                'tarifa.id_tarifa as rate_id',
                'tarifa.descripciont',
                'tarifa.precio',
                'tarifa.tipo as rate_tipo',
                'tarifa.estadot',
                'tarifa.fcreada',
                'tarifa.deletedatt'
            )
            .join('tarifa', 'oferta.idtarifa', 'tarifa.id_tarifa')
            .where('tarifa.estadot', 'ACTIVO')
            .whereNull('tarifa.deletedatt');

        if (rideType === 'CITY') {
            query.where('tarifa.tipo', 'TRASLADO_CIUDAD');
        } else if (rideType === 'AIRPORT') {
            query.whereNot('tarifa.tipo', 'TRASLADO_CIUDAD');
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
     * Find offerings for a specific service filtered by ride type
     * @param {number} codigos - Service ID
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of filtered offerings
     */
    async findByServiceAndType(codigos, rideType) {
        const query = this.db(this.tableName)
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
            .join('tarifa', 'oferta.idtarifa', 'tarifa.id_tarifa')
            .where('tarifa.estadot', 'ACTIVO')
            .whereNull('tarifa.deletedatt');

        if (rideType === 'CITY') {
            query.where('tarifa.tipo', 'TRASLADO_CIUDAD');
        } else if (rideType === 'AIRPORT') {
            query.whereNot('tarifa.tipo', 'TRASLADO_CIUDAD');
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
     * Find offerings for a specific service filtered by ride type
     * @param {number} codigos - Service ID
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of filtered offerings
     */
    async findByServiceAndType(codigos, rideType) {
        const query = this.db(this.tableName)
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
            .join('tarifa', 'oferta.idtarifa', 'tarifa.id')
            .where({
                'oferta.codigos': codigos,
                'tarifa.estadot': 'ACTIVO'
            })
            .whereNull('tarifa.deletedatt');

        if (rideType === 'CITY') {
            query.where('tarifa.tipo', 'TRASLADO_CIUDAD');
        } else if (rideType === 'AIRPORT') {
            query.whereNot('tarifa.tipo', 'TRASLADO_CIUDAD');
        }

        const results = await query;

        // Transform results to RateModel instances and return their JSON representation
        return results.map(result => 
            RateModel.fromDB({
                id: result.id,
                tipo: result.tipo,
                descripciont: result.descripciont,
                precio: result.precio,
                estadot: result.estadot,
                fcreada: result.fcreada,
                deletedatt: result.deletedatt
            }).toJSON()
        );
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
} 