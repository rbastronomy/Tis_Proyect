import { BaseRepository } from '../core/BaseRepository.js';

/**
 * Repository class for taxi-related database operations
 * @class TaxiRepository
 * @extends BaseRepository
 */
export class TaxiRepository extends BaseRepository {
    /**
     * Creates an instance of TaxiRepository
     */
    constructor() {
        super('taxi', 'patente');
    }

    /**
     * Create new taxi
     * @param {Object} taxiData - Raw taxi data
     * @returns {Promise<Object>} Created taxi raw data
     */
    async create(taxiData) {
        try {
            const now = new Date();
            const [createdTaxi] = await this.db(this.tableName)
                .insert({
                    ...taxiData,
                    created_at: now,
                    updated_at: now
                })
                .returning('*');
            return createdTaxi;
        } catch (error) {
            throw new Error(`Database error creating taxi: ${error.message}`);
        }
    }

    /**
     * Update taxi
     * @param {string} patente - License plate
     * @param {Object} updateData - Raw update data
     * @returns {Promise<Object|null>} Updated taxi raw data or null
     */
    async update(patente, updateData) {
        try {
            const [updatedTaxi] = await this.db(this.tableName)
                .where({ patente })
                .update({
                    ...updateData,
                    updated_at: new Date()
                })
                .returning('*');

            if (!updatedTaxi) {
                throw new Error('Taxi not found');
            }

            return updatedTaxi;
        } catch (error) {
            throw new Error(`Database error updating taxi: ${error.message}`);
        }
    }

    /**
     * Soft delete taxi
     * @param {string} patente - License plate
     * @returns {Promise<Object|null>} Deleted taxi raw data or null
     */
    async softDelete(patente) {
        try {
            const [deletedTaxi] = await this.db(this.tableName)
                .where({ patente })
                .update({
                    estado_taxi: 'ELIMINADO',
                    deleted_at_taxi: new Date()
                })
                .returning('*');
            return deletedTaxi || null;
        } catch (error) {
            throw new Error(`Database error deleting taxi: ${error.message}`);
        }
    }

    /**
     * Find taxi by license plate
     * @param {string} patente - License plate
     * @returns {Promise<Object|null>} Raw taxi data or null
     */
    async findByPatente(patente) {
        try {
            console.log('TaxiRepository - Finding taxi with patente:', patente);
            
            const taxi = await this.db(this.tableName)
                .select('*')
                .where('patente', patente)
                .whereNull('deleted_at_taxi')
                .first();

            console.log('TaxiRepository - Raw taxi data:', taxi);
            return taxi || null;
        } catch (error) {
            console.error('TaxiRepository - Error finding taxi:', error);
            throw new Error(`Database error finding taxi: ${error.message}`);
        }
    }

    /**
     * Get all taxis
     * @param {Object} query - Query parameters
     * @returns {Promise<Object[]>} Array of raw taxi data
     */
    async getAll(query = {}) {
        try {
            let queryBuilder = this.db(this.tableName)
                .select('*')
                .whereNull('deleted_at_taxi');

            // Add status filter if provided
            if (query.status) {
                queryBuilder = queryBuilder.where('estado_taxi', query.status);
            }

            return await queryBuilder;
        } catch (error) {
            throw new Error(`Database error fetching taxis: ${error.message}`);
        }
    }

    /**
     * Get all taxis assigned to a specific driver
     * @param {string} rut - Driver's RUT
     * @returns {Promise<Array>} Array of raw taxi data
     */
    async getTaxisByDriver(rut) {
        try {
            const taxis = await this.db(this.tableName)
                .where('rut_conductor', rut)
                .whereNull('deleted_at_taxi');
            
            return taxis;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * Find taxi by ID (alias for findByPatente)
     * @param {string} patente - Taxi's license plate
     * @returns {Promise<Object|null>} Raw taxi data or null
     */
    async findById(patente) {
        return this.findByPatente(patente);
    }
}