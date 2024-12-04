import { BaseService } from '../core/BaseService.js';
import { ServiceModel } from '../models/ServiceModel.js';
import { ServicioRepository } from '../repository/ServicioRepository.js';
import { TarifaService } from './TarifaService.js';

export class ServiceService extends BaseService {
    constructor() {
        const serviceModel = new ServiceModel();
        super(serviceModel);
        this.repository = new ServicioRepository();
        this.tarifaService = new TarifaService();
    }

    /**
     * Gets all active services with their associated tariffs
     * @returns {Promise<Array>} List of active services with tariff information
     * @throws {Error} If there's an error retrieving the services
     */
    async findActiveWithTariffs() {
        try {
            const activeServices = await this.repository.findActive();
            
            // Get tariffs for each service
            const servicesWithTariffs = await Promise.all(
                activeServices.map(async (service) => {
                    const tariffs = await this.tarifaService.findActiveByService(service.codigos);
                    return {
                        ...service,
                        tarifas: tariffs
                    };
                })
            );

            return servicesWithTariffs;
        } catch (error) {
            throw new Error(`Error retrieving active services: ${error.message}`);
        }
    }

    /**
     * Gets services filtered by ride type
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of services for the specified ride type
     * @throws {Error} If there's an error retrieving the services
     */
    async findByRideType(rideType) {
        try {
            const services = await this.repository.findActive();
            const tariffs = await this.tarifaService.findByRideType(rideType);
            
            // Filter services that have tariffs for the specified ride type
            const serviceIds = new Set(tariffs.map(t => t._data.servicio_id));
            return services.filter(service => serviceIds.has(service._data.codigos));
        } catch (error) {
            throw new Error(`Error retrieving services by ride type: ${error.message}`);
        }
    }

    /**
     * Gets tariffs for a specific service filtered by ride type
     * @param {number} codigos - Service ID
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of filtered tariffs
     * @throws {Error} If there's an error retrieving the tariffs
     */
    async getTariffsByType(codigos, rideType) {
        try {
            return await this.tarifaService.findByServiceAndType(codigos, rideType);
        } catch (error) {
            throw new Error(`Error retrieving service tariffs: ${error.message}`);
        }
    }

    /**
     * Find service by its code
     * @param {number} codigos - Service code
     * @returns {Promise<Object>} Service data
     * @throws {Error} If service is not found
     */
    async findByCodigos(codigos) {
        try {
            const service = await this.repository.findById(codigos);
            if (!service) {
                throw new Error('Servicio no encontrado');
            }
            return service;
        } catch (error) {
            throw new Error(`Error retrieving service: ${error.message}`);
        }
    }
}
