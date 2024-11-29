import { BaseController } from "../core/BaseController";
import { TripService } from "../services/TripService";

export class TripController extends BaseController {
    constructor() {
        const tripService = new TripService();
        super(tripService);
        this.service = tripService;
    }

    /*
    async createTrip(request, reply) {
        try {
            const tripData = request.body;
            const trip = await this.service.createTrip(tripData);
            return reply.status(201).send(trip);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }
    */
    async updateTrip(request, reply) {
        try {
            const { codigo } = request.params;
            const tripData = request.body;
            const trip = await this.service.updateTrip(codigo, tripData);
            return reply.send(trip);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }

    async deleteTrip(request, reply) {
        try {
            const { codigo } = request.params;
            const trip = await this.service.deleteTrip(codigo);
            return reply.send(trip);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }

    async listTrips(request, reply) {
        try {
            // Add pagination support
            const { 
                page = 1, 
                limit = 10, 
                sortBy = 'createdAt', 
                sortOrder = 'desc' 
            } = request.query;

            const { trips, total } = await this.service.getAll({
                page: Number(page),
                limit: Number(limit),
                sortBy,
                sortOrder
            });

            return reply.send({
                trips,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total
                }
            });
        } catch (error) {
            return reply.status(500).send({ message: error.message });
        }
    }

    async getTrip(request, reply) {
        try {
            const { codigo } = request.params;
            const trip = await this.service.getTrip(codigo);
            return reply.send(trip);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }

    async getTripByUser(request, reply) {
        try {
            const { rut } = request.params;
            const trips = await this.service.getTripByUser(rut);
            return reply.send(trips);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }

    async getTripByDriver(request, reply) {
        try {
            const { rut } = request.params;
            const trips = await this.service.getTripByDriver(rut);
            return reply.send(trips);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }

    async getAlltripByStatus(request, reply) {
        try {
            const { status } = request.params;
            const trips = await this.service.getAlltripByStatus(status);
            return reply.send(trips);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }

}

export default TripController;