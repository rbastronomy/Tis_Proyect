import { BaseRepository } from '../core/BaseRepository.js';

export class TaxiRepository extends BaseRepository {
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
            return updatedTaxi || null;
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
            const taxi = await this.db(this.tableName)
                .select('*')
                .where({ patente })
                .whereNull('deleted_at_taxi')
                .first();
            return taxi || null;
        } catch (error) {
            throw new Error(`Database error finding taxi: ${error.message}`);
        }
    }

    /**
     * Get all taxis
     * @returns {Promise<Object[]>} Array of raw taxi data
     */
    async getAll() {
        try {
            const taxis = await this.db(this.tableName)
                .select('*')
                .whereNull('deleted_at_taxi');
            return taxis;
        } catch (error) {
            throw new Error(`Database error fetching taxis: ${error.message}`);
        }
    }
}

export default TaxiRepository;