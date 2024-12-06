import { BaseService } from '../core/BaseService.js';
import { OfferingRepository } from '../repository/OfferingRepository.js';

export class OfferingService extends BaseService {
    constructor() {
        super(new OfferingRepository());
    }

    /**
     * Obtiene ofertas filtradas por servicio y tipo de viaje
     * @param {number} codigos - ID del servicio
     * @param {string} rideType - Tipo de viaje (CITY o AIRPORT)
     * @returns {Promise<Array>} Lista de tarifas filtradas
     */
    async findByServiceAndType(codigos, rideType) {
        try {
            const offerings = await this.repository.findByServiceWithRates(codigos);
            
            // Filtrar por tipo de viaje
            const filteredOfferings = offerings.filter(offering => {
                if (rideType === 'CITY') {
                    return offering.rate.tipo === 'TRASLADO_CIUDAD';
                }
                return offering.rate.tipo !== 'TRASLADO_CIUDAD';
            });

            return filteredOfferings.map(offering => offering.rate);
        } catch (error) {
            throw new Error(`Error al obtener ofertas: ${error.message}`);
        }
    }
} 