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

            console.log('TripController - Creating trip:', {
                codigoreserva,
                tripData
            });

            const trip = await this.service.createFromBooking(
                codigoreserva,
                tripData
            );

            console.log('TripController - Trip created:', trip.toJSON());

            return reply.code(201).send({
                message: 'Viaje registrado exitosamente',
                trip: trip.toJSON()
            });
        } catch (error) {
            request.log.error(error);
            console.error('TripController - Error creating trip:', {
                error: error.message,
                stack: error.stack
            });
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
     * Get trip details
     * @param {import('fastify').FastifyRequest} request
     * @param {import('fastify').FastifyReply} reply
     */
    async getTripDetails(request, reply) {
        try {
            const { codigoReserva } = request.params;
            const trip = await this.service.getTripWithDetails(codigoReserva);
            return reply.send({
                message: 'Detalles del viaje recuperados exitosamente',
                trip: trip.toJSON()
            });
        } catch (error) {
            console.error('TripController - Error getting trip details:', error);
            throw error;
        }
    }
}

export default TripController;