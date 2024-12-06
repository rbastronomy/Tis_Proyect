import { BaseService } from '../core/BaseService.js';
import { ServiceModel } from '../models/ServiceModel.js';
import { ServicioRepository } from '../repository/ServicioRepository.js';
import { TarifaService } from './TarifaService.js';
import { OfferingService } from './OfferingService.js';

export class ServiceService extends BaseService {
    constructor() {
        const serviceModel = new ServiceModel();
        super(serviceModel);
        this.repository = new ServicioRepository();
        this.tarifaService = new TarifaService();
        this.offeringService = new OfferingService();
    }

    /**
     * Gets services filtered by ride type (CITY or AIRPORT)
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of services for the specified ride type
     * @throws {Error} If there's an error retrieving the services
     */
    async findByRideType(rideType) {
        try {
            // Get all active services first
            const services = await this.repository.findActive();
            
            // Get offerings for the ride type
            const offerings = await this.offeringService.findByRideType(rideType);
            
            // Create a Set of service IDs that have offerings for this ride type
            const serviceIds = new Set(offerings.map(offering => offering.codigos));
            
            // Filter services that have offerings for this ride type
            const filteredServices = services.filter(service => 
                serviceIds.has(service.codigos)
            );

            return filteredServices;
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
            // Get offerings for this service
            const offerings = await this.offeringService.findByServiceAndType(codigos, rideType);
            
            // Extract unique tariff IDs from offerings
            const tariffIds = [...new Set(offerings.map(offering => offering.idtarifa))];
            
            // Get tariff details for each ID
            const tariffs = await Promise.all(
                tariffIds.map(id => this.tarifaService.findById(id))
            );
            
            // Filter out any null values and inactive tariffs
            return tariffs
                .filter(tariff => tariff && tariff.estadot === 'ACTIVO')
                .map(tariff => ({
                    id: tariff.id,
                    tipo: tariff.tipo,
                    descripciont: tariff.descripciont,
                    precio: tariff.precio,
                    estadot: tariff.estadot
                }));
        } catch (error) {
            throw new Error(`Error retrieving service tariffs: ${error.message}`);
        }
    }

    /**
     * Gets all active services with their associated tariffs
     * @returns {Promise<Array>} List of active services with tariff information
     * @throws {Error} If there's an error retrieving the services
     */
    async findActiveWithTariffs() {
        try {
            const activeServices = await this.repository.findActive();
            
            // Get offerings and tariffs for each service
            const servicesWithTariffs = await Promise.all(
                activeServices.map(async (service) => {
                    const offerings = await this.offeringService.findByService(service.codigos);
                    const tariffIds = [...new Set(offerings.map(o => o.idtarifa))];
                    const tariffs = await Promise.all(
                        tariffIds.map(id => this.tarifaService.findById(id))
                    );
                    
                    return {
                        ...service,
                        tarifas: tariffs.filter(t => t && t.estadot === 'ACTIVO')
                    };
                })
            );

            return servicesWithTariffs;
        } catch (error) {
            throw new Error(`Error retrieving active services: ${error.message}`);
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
