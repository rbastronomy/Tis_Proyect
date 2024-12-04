import { BaseController } from "../core/BaseController.js";
import { ViajeService } from "../services/ViajeService.js";

export class ViajeController extends BaseController {

    constructor(){
        const viajeService = new ViajeService();
        super(viajeService);
    }

    async getViajesByDriver(request, reply){
        const { rut } = request.params;

        try {
            const viaje = await this.service.getViajesByDriver(rut);
            return reply.send({ viaje });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retrieve viajes by driver' });
        }
    }

    async getViajesByDateRange(request, reply){
        const { startDate, endDate } = request.query;

        try {
            const viajes = await this.service.getViajesByDateRange(startDate, endDate);
            return reply.send({ viajes });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retrieve viajes by date range' });
        }
    }



}