import { BaseController } from "../core/BaseController.js";
import { TripService } from "../services/TripService.js";

/** @typedef {import('fastify').FastifyRequest} FastifyRequest */
/** @typedef {import('fastify').FastifyReply} FastifyReply */

export class TripController extends BaseController {
    constructor() {
        const tripService = new TripService();
        super(tripService);
    }

    /**
     * Creates a trip record from completed booking
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async createFromBooking(request, reply) {
        try {
            const { codigoreserva } = request.params;
            const tripData = request.body;

            const trip = await this.service.createFromBooking(
                codigoreserva,
                tripData
            );

            return reply.code(201).send({
                message: 'Viaje registrado exitosamente',
                trip: trip.toJSON()
            });
        } catch (error) {
            request.log.error(error);
            return this.handleError(reply, error);
        }
    }

    /**
     * Gets trips by driver
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async getDriverTrips(request, reply) {
        try {
            const { driverId } = request.params;
            const trips = await this.service.getDriverTrips(driverId);
            
            return reply.send({
                message: 'Viajes recuperados exitosamente',
                trips: trips.map(trip => trip.toJSON())
            });
        } catch (error) {
            request.log.error(error);
            return this.handleError(reply, error);
        }
    }

    /**
     * Gets trips by client
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async getClientTrips(request, reply) {
        try {
            const { clientId } = request.params;
            const trips = await this.service.getClientTrips(clientId);
            
            return reply.send({
                message: 'Viajes recuperados exitosamente',
                trips: trips.map(trip => trip.toJSON())
            });
        } catch (error) {
            request.log.error(error);
            return this.handleError(reply, error);
        }
    }

    /**
     * Gets trip details
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async getTripDetails(request, reply) {
        try {
            const { tripId } = request.params;
            const trip = await this.service.getTripWithDetails(tripId);
            
            return reply.send({
                message: 'Viaje recuperado exitosamente',
                trip: trip.toJSON()
            });
        } catch (error) {
            request.log.error(error);
            return this.handleError(reply, error);
        }
    }
}

export default TripController;