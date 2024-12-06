import { BaseService } from '../core/BaseService.js';
import { OfferingModel } from '../models/OfferingModel.js';
import { OfferingRepository } from '../repository/OfferingRepository.js';

export class OfferingService extends BaseService {
    constructor() {
        const offeringModel = new OfferingModel();
        super(offeringModel);
        this.repository = new OfferingRepository();
    }

    /**
     * Find all offerings for a specific service
     * @param {number} codigos - Service ID
     * @returns {Promise<Array>} List of offerings for the service
     * @throws {Error} If there's an error retrieving the offerings
     */
    async findByService(codigos) {
        try {
            return await this.repository.findByService(codigos);
        } catch (error) {
            throw new Error(`Error retrieving offerings for service: ${error.message}`);
        }
    }

    /**
     * Find offerings by ride type (CITY or AIRPORT)
     * @param {string} rideType - Type of ride
     * @returns {Promise<Array>} List of offerings for the ride type
     * @throws {Error} If there's an error retrieving the offerings
     */
    async findByRideType(rideType) {
        try {
            return await this.repository.findByRideType(rideType);
        } catch (error) {
            throw new Error(`Error retrieving offerings by ride type: ${error.message}`);
        }
    }

    /**
     * Find offerings for a specific service filtered by ride type
     * @param {number} codigos - Service ID
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of filtered offerings
     * @throws {Error} If there's an error retrieving the offerings
     */
    async findByServiceAndType(codigos, rideType) {
        try {
            return await this.repository.findByServiceAndType(codigos, rideType);
        } catch (error) {
            throw new Error(`Error retrieving offerings by service and type: ${error.message}`);
        }
    }

    /**
     * Create a new offering
     * @param {Object} data - Offering data
     * @param {number} data.idtarifa - Tariff ID
     * @param {number} data.codigos - Service ID
     * @returns {Promise<Object>} Created offering
     * @throws {Error} If there's an error creating the offering
     */
    async create(data) {
        try {
            const offering = await this.repository.create({
                ...data,
                created_at: new Date(),
                updated_at: new Date()
            });
            return offering;
        } catch (error) {
            throw new Error(`Error creating offering: ${error.message}`);
        }
    }

    /**
     * Update an existing offering
     * @param {number} id - Offering ID
     * @param {Object} data - Updated offering data
     * @returns {Promise<Object>} Updated offering
     * @throws {Error} If there's an error updating the offering
     */
    async update(id, data) {
        try {
            const offering = await this.repository.update(id, {
                ...data,
                updated_at: new Date()
            });
            return offering;
        } catch (error) {
            throw new Error(`Error updating offering: ${error.message}`);
        }
    }

    /**
     * Delete an offering
     * @param {number} id - Offering ID
     * @returns {Promise<void>}
     * @throws {Error} If there's an error deleting the offering
     */
    async delete(id) {
        try {
            await this.repository.delete(id);
        } catch (error) {
            throw new Error(`Error deleting offering: ${error.message}`);
        }
    }
} 