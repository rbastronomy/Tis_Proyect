import { BaseController } from "../core/BaseController";
import { RateService } from "../services/RateService";

const rateService = new RateService();

export class RateController extends BaseController {
    constructor() {
        const rateService = new RateService();
        super(rateService);
        this.service = rateService;
    }

    async createRate(request, reply) {
        try {
            const rateData = request.body;
            const createdRate = await this.service.createRate(rateData);
            return request.status(201).send({ rate: createdRate.toJSON() });
        } catch (error) {
            return reply.status(400).send({error: error.message});
        }
    }

    async updateRate(request, reply) {
        try {
            const { id_tarifa } = request.params;
            const updateData = request.body;
            const updatedRate = await this.service.updateRate(id_tarifa, updateData);
            return reply.status(200).send(updatedRate);
        } catch (error) {
            return reply.status(400).send({error: error.message});
        }
    }

    async deleteRate(request, reply) {
        try {
            const { id_tarifa } = request.params;
            const deletedRate = await this.service.deleteRate(id_tarifa);
            return reply.status(200).send(deletedRate);
        } catch (error) {
            return reply.status(400).send({error: error.message});
        }
    }

    async getRateById(request, reply) {
        try {
            const { id_tarifa } = request.params;
            const rate = await this.service.getRateById(id_tarifa);
            return reply.status(200).send(rate);
        } catch (error) {
            return reply.status(400).send({error: error.message});
        }
    }
    
    async getAllRates(request, reply) {
        try {
            const rates = await this.service.getAllRates();
            return reply.status(200).send(rates);
        } catch (error) {
            return reply.status(400).send({error: error.message});
        }
    }

    async getRatesByType(request, reply) {
        try {
            const { tipo_tarifa } = request.params;
            const rates = await this.service.findByRideType(tipo_tarifa);
            return reply.status(200).send(rates);
        } catch (error) {
            return reply.status(400).send({error: error.message});
        }
    }
}

module.exports = RateController;