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
     * @param {number} codigo_servicio - Service ID
     * @returns {Promise<Array>} List of offerings for the service
     * @throws {Error} If there's an error retrieving the offerings
     */
    async findByService(codigo_servicio) {
        try {
            return await this.repository.findByService(codigo_servicio);
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
            const offeringsDB = await this.repository.findByRideType(rideType);
            return offeringsDB;
        } catch (error) {
            throw new Error(`Error retrieving offerings by ride type: ${error.message}`);
        }
    }

    /**
     * Find offerings for a specific service filtered by ride type
     * @param {number} codigo_servicio - Service ID
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of filtered offerings
     * @throws {Error} If there's an error retrieving the offerings
     */
    async findByServiceAndType(codigo_servicio, rideType) {
        try {
            return await this.repository.findByServiceAndType(codigo_servicio, rideType);
        } catch (error) {
            throw new Error(`Error retrieving offerings by service and type: ${error.message}`);
        }
    }

    /**
     * Create a new offering
     * @param {Object} data - Offering data
     * @param {number} data.id_tarifa - Tariff ID
     * @param {number} data.codigo_servicio - Service ID
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

    /**
     * Find offering ID by service code and rate ID
     * @param {number} codigo_servicio - Service ID
     * @param {number} id_tarifa - Rate ID
     * @returns {Promise<number|null>} Offering ID if found, null otherwise
     * @throws {Error} If there's an error retrieving the offering
     */
    async findIdByServiceAndRate(codigo_servicio, id_tarifa) {
        try {
            return await this.repository.findOne({
                codigo_servicio,
                id_tarifa
            });
        } catch (error) {
            throw new Error(`Error finding offering by service and rate: ${error.message}`);
        }
    }

    /**
     * Find offering by its ID
     * @param {number} id_oferta - Offering ID
     * @returns {Promise<Object|null>} Offering with service and rate IDs if found, null otherwise
     * @throws {Error} If there's an error retrieving the offering
     */
    async findById(id_oferta) {
        try {
            return await this.repository.findById(id_oferta);
        } catch (error) {
            throw new Error(`Error finding offering: ${error.message}`);
        }
    }
} 