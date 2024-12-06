import { BaseController } from '../core/BaseController.js';
import { OfferingService } from '../services/OfferingService.js';

export class OfferingController extends BaseController {
    constructor() {
        super(new OfferingService());
    }

    /**
     * Obtiene las tarifas disponibles para un servicio según el tipo de viaje
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     */
    async getOfferingsByServiceAndType(request, reply) {
        const { codigos, rideType } = request.params;

        try {
            const tariffs = await this.service.findByServiceAndType(
                parseInt(codigos), 
                rideType
            );
            return reply.send(tariffs);
        } catch (error) {
            return reply.status(500).send({
                message: 'Error al obtener las tarifas del servicio',
                error: error.message
            });
        }
    }
} 