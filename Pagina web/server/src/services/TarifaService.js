import { BaseService } from '../core/BaseService.js';
import { TarifaModel } from '../models/TarifaModel.js';
import { TarifaRepository } from '../repository/TarifaRepository.js';

export class TarifaService extends BaseService {
    constructor() {
        const tarifaModel = new TarifaModel();
        super(tarifaModel);
        this.repository = new TarifaRepository();
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
     */
    async findActiveByService(servicioId) {
        try {
            const tariffs = await this.repository.findActiveByService(servicioId);
            return tariffs;
        } catch (error) {
            throw new Error(`Error retrieving service tariffs: ${error.message}`);
        }
    }

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
            const tariff = await this.repository.findById(id);
            if (!tariff) {
                throw new Error('Tarifa no encontrada');
            }
            return tariff;
        } catch (error) {
            throw new Error(`Error retrieving tariff: ${error.message}`);
        }
    }
} 