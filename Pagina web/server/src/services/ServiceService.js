import { BaseService } from '../core/BaseService.js';
import { ServiceModel } from '../models/ServiceModel.js';
import { ServiceRepository } from '../repository/ServiceRepository.js';
import { RateService } from './RateService.js';
import { OfferingService } from './OfferingService.js';

export class ServiceService extends BaseService {
    constructor() {
        const serviceModel = new ServiceModel();
        super(serviceModel);
        this.repository = new ServiceRepository();
        this.rateService = new RateService();
        this.offeringService = new OfferingService();
    }

    /**
     * Gets services filtered by ride type (CITY or AIRPORT)
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<ServiceModel[]>} List of service models for the specified ride type
     * @throws {Error} If there's an error retrieving the services
     */
    async findByRideType(rideType) {
        try {
            // Get all active services first and convert to models
            const servicesDB = await this.repository.findActive();
            const serviceModels = ServiceModel.toModels(servicesDB);
            
            // Get offerings for the ride type
            const offeringsDB = await this.offeringService.findByRideType(rideType);
            
            // Create a Set of service IDs that have offerings for this ride type
            const serviceIds = new Set(offeringsDB.map(offering => offering.codigo_servicio));
            
            // Create a Set of unique tariff IDs from offerings
            const tariffIds = [...new Set(offeringsDB.map(offering => offering.id_tarifa))];
            
            // Get all tariffs data in one batch (already as models from RateService)
            const tariffs = await Promise.all(
                tariffIds.map(id => this.rateService.findById(id))
            );
            
            // Create a Map for quick tariff lookups
            const tariffsMap = new Map(
                tariffs.map(tariff => [tariff.id_tarifa, tariff])
            );
            
            // Filter services and attach their tariffs
            return serviceModels
                .filter(service => serviceIds.has(service.codigo_servicio))
                .map(service => {
                    // Get offerings for this service
                    const serviceOfferings = offeringsDB.filter(
                        offering => offering.codigo_servicio === service.codigo_servicio
                    );
                    
                    // Get tariffs for these offerings and filter active ones
                    const serviceTariffs = serviceOfferings
                        .map(offering => tariffsMap.get(offering.id_tarifa))
                        .filter(tariff => tariff && tariff.isActive());

                    // Attach tariffs to the service model
                    service.tarifas = serviceTariffs;
                    return service;
                });

        } catch (error) {
            throw new Error(`Error retrieving services by ride type: ${error.message}`);
        }
    }

    /**
     * Gets tariffs for a specific service filtered by ride type
     * @param {number} codigo_servicio - Service ID
     * @param {string} rideType - Type of ride (CITY or AIRPORT)
     * @returns {Promise<Array>} List of filtered tariffs
     * @throws {Error} If there's an error retrieving the tariffs
     */
    async getTariffsByType(codigo_servicio, rideType) {
        try {
            // Get offerings for this service
            const offerings = await this.offeringService.findByServiceAndType(codigo_servicio, rideType);
            
            // Extract unique tariff IDs from offerings
            const tariffIds = [...new Set(offerings.map(offering => offering.id_tarifa))];
            
            // Get tariff details for each ID
            const tariffs = await Promise.all(
                tariffIds.map(id => this.RateService.findById(id))
            );
            
            // Filter out any null values and inactive tariffs
            return tariffs
                .filter(tariff => tariff && tariff.estadot === 'ACTIVO')
                .map(tariff => ({
                    id_tarifa: tariff.id_tarifa,
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
                    const offerings = await this.offeringService.findByService(service.codigo_servicio);
                    const tariffIds = [...new Set(offerings.map(o => o.id_tarifa))];
                    const tariffs = await Promise.all(
                        tariffIds.map(id => this.rateService.findById(id))
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
     * @param {number} codigo_servicio - Service code
     * @returns {Promise<Object>} Service data
     * @throws {Error} If service is not found
     */
    async findByCodigos(codigo_servicio) {
        try {
            const service = await this.repository.findById(codigo_servicio);
            if (!service) {
                throw new Error('Servicio no encontrado');
            }
            return ServiceModel.toModel(service);
        } catch (error) {
            throw new Error(`Error retrieving service: ${error.message}`);
        }
    }
}
