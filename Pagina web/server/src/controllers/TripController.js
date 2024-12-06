import { BaseController } from "../core/BaseController.js";
import { TripService } from "../services/TripServices.js";

export class TripController extends BaseController {
    constructor() {
        const tripService = new TripService();
        super(tripService);
        this.service = tripService;
    }

    /**
     * Create a new trip
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async createTrip(request, reply) {
        try {
            const tripData = request.body;
            const newTrip = await this.service.createTrip(tripData);
            return reply.code(201).send(newTrip);
        } catch (error) {
            request.log.error(error);
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: error.message
            });
        }
    }

    /**
     * Update an existing trip
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async updateTrip(request, reply) {
        try {
            const { codigo_viaje } = request.params;
            const tripData = request.body;
            const trip = await this.service.updateTrip(codigo_viaje, tripData);
            return reply.code(200).send(trip);
        } catch (error) {
            request.log.error(error);
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: error.message
            });
        }
    }

    /**
     * Delete a trip
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async deleteTrip(request, reply) {
        try {
            const { code } = request.params;
            const trip = await this.service.deleteTrip(code);
            return reply.code(200).send(trip);
        } catch (error) {
            request.log.error(error);
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: error.message
            });
        }
    }

    /**
     * Get a list of trips with pagination
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async listTrips(request, reply) {
        try {
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

            return reply.code(200).send({
                trips,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total
                }
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                statusCode: 500,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }

    /**
     * Get a specific trip by code
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async getTrip(request, reply) {
        try {
            const { code } = request.params;
            const trip = await this.service.getTripById(code);
            return reply.code(200).send(trip);
        } catch (error) {
            request.log.error(error);
            return reply.code(404).send({
                statusCode: 404,
                error: 'Not Found',
                message: error.message
            });
        }
    }

    /**
     * Get trips by user
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async getTripsByUser(request, reply) {
        try {
            const { userId } = request.params;
            const trips = await this.service.getTripsByUser(userId);
            return reply.code(200).send(trips);
        } catch (error) {
            request.log.error(error);
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: error.message
            });
        }
    }

    /**
     * Get trips by driver
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async getTripsByDriver(request, reply) {
        try {
            const { driverId } = request.params;
            const trips = await this.service.getTripsByDriver(driverId);
            return reply.code(200).send(trips);
        } catch (error) {
            request.log.error(error);
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: error.message
            });
        }
    }

    /**
     * Complete a trip
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async completeTrip(request, reply) {
        try {
            const { code } = request.params;
            const additionalData = request.body;
            await this.service.completeTrip(code, additionalData);
            return reply.code(200).send({
                message: 'Trip completed successfully'
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                statusCode: 500,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }

    /**
     * Cancel a trip
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async cancelTrip(request, reply) {
        try {
            const { code } = request.params;
            await this.service.cancelTrip(code);
            return reply.code(200).send({
                message: 'Trip cancelled successfully'
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                statusCode: 500,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }

    /**
     * Get trips by status
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async getTripsByStatus(request, reply) {
        try {
            const { status } = request.params;
            const trips = await this.service.getTripsByStatus(status);
            return reply.code(200).send(trips);
        } catch (error) {
            request.log.error(error);
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: error.message
            });
        }
    }
}

export default TripController;