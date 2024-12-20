import { BaseService } from '../core/BaseService.js';
import { RateModel } from '../models/RateModel.js';
import { RateRepository } from '../repository/RateRepository.js';

export class RateService extends BaseService {
    constructor() {
        const rateModel = new RateModel();
        super(rateModel);
        this.repository = new RateRepository();
    }

    async createRate(rateData) {
        try {
            const rate = await this.repository.create(rateData);
            return rate;
        } catch (error) {
            throw new Error(`Error creating rate: ${error.message}`);
        }
    }

    async deleteRate(id_tarifa){
        try {
            const rate = await this.repository.softDelete(id_tarifa);
            return rate;
        } catch (error) {
            throw new Error(`Error deleting rate: ${error.message}`);
        }
    }

    async updateRate(id_tarifa, rateData) {
        try {
            return await this.repository.update(id_tarifa, rateData);
        } catch (error) {
            console.error('Error updating rate:', error);
            throw new Error('Failed to update rate');
        }
    }

    async findAllRate(){
        try {
            const rates = await this.repository.findAll();
            return rates;
        } catch (error) {
            throw new Error(`Error retrieving rates: ${error.message}`);
        }
    }

    /**
     * Gets tariffs by ride type (CITY or AIRPORT)
     * @param {string} rideType - Type of ride
     * @returns {Promise<Array>} List of tariffs for the specified ride type
     * @throws {Error} If there's an error retrieving the tariffs
     */
    async findByRideType(rideType) {
        try {
            const tariffs = await this.repository.findByRideType(rideType);
            return tariffs;
        } catch (error) {
            throw new Error(`Error retrieving tariffs by ride type: ${error.message}`);
        }
    }

    /**
     * Gets active tariffs for a specific service
     * @param {number} servicioId - ID of the service
     * @returns {Promise<Array>} List of active tariffs for the service
     * @throws {Error} If there's an error retrieving the tariffs
     
    async findActiveByService(servicioId) {
        try {
            const tariffs = await this.repository.findActiveByService(servicioId);
            return tariffs;
        } catch (error) {
            throw new Error(`Error retrieving service tariffs: ${error.message}`);
        }
    }
    */

    /**
     * Gets active tariffs for a service filtered by ride type
     * @param {number} servicioId - ID of the service
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of filtered tariffs
     * @throws {Error} If there's an error retrieving the tariffs
     */
    async findByServiceAndType(servicioId, rideType) {
        try {
            const tariffs = await this.repository.findByServiceAndType(servicioId, rideType);
            return tariffs;
        } catch (error) {
            throw new Error(`Error retrieving service tariffs by type: ${error.message}`);
        }
    }

    /**
     * Find tariff by its ID
     * @param {number} id - Tariff ID
     * @returns {Promise<Object>} Tariff data
     * @throws {Error} If tariff is not found
     */
    async findById(id) {
        try {
            const tariffDB = await this.repository.findById(id);
            if (!tariffDB) {
                throw new Error('Tarifa no encontrada');
            }
            const tariff = RateModel.toModel(tariffDB);
            return tariff;
        } catch (error) {
            throw new Error(`Error retrieving tariff: ${error.message}`);
        }
    }
} 