import { BaseController } from "../core/BaseController.js";
import { RatingService } from "../services/RatingService.js";

export default class RatingController extends BaseController {
    constructor() {
        const ratingService = new RatingService();
        super(ratingService);
        this.service = ratingService;
    }

    async getRating(request, reply) {
        try {
            const { id_valoracion } = request.params;
            const rating = await this.service.getRatingById(id_valoracion);
            return reply.code(200).send(rating);
        } catch (error) {
            request.log.error(error);
            return reply.code(404).send({
                statusCode: 404,
                error: 'Not Found',
                message: error.message
            });
        }
    }

    async getRatingForTrip(request, reply) {
        try {
            const { codigo_viaje } = request.params;
            const ratings = await this.service.getRatingForTrip(codigo_viaje);
            return reply.code(200).send(ratings);
        } catch (error) {
            request.log.error(error);
            return reply.code(404).send({
                statusCode: 404,
                error: 'Not Found',
                message: error.message
            });
        }
    }

    async createRating(request, reply) {
        try {
            const ratingData = request.body;
            const newRating = await this.service.createRating(ratingData);
            return reply.code(201).send(newRating);
        } catch (error) {
            request.log.error(error);
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: error.message
            });
        }
    }

    async updateRating(request, reply) {
        try {
            const { id_valoracion } = request.params;
            const ratingData = request.body;
            await this.service.updateRating(id_valoracion, ratingData);
            return reply.code(200).send({
                message: 'Rating updated successfully'
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

    async deleteRating(request, reply) {
        try {
            const { id_valoracion } = request.params;
            await this.service.deleteRating(id_valoracion);
            return reply.code(200).send({
                message: 'Rating deleted successfully'
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

    async getRatingByTrip(request, reply) {
        try {
            const { codigo_viaje } = request.params;
            const rating = await this.service.getRatingForTrip(codigo_viaje);
            return reply.code(200).send(rating);
        } catch (error) {
            request.log.error(error);
            return reply.code(404).send({
                statusCode: 404,
                error: 'Not Found',
                message: error.message
            });
        }
    }

    async getRatingByUser(request, reply) {
        try {
            const { id_usuario } = request.params;
            const rating = await this.service.getRatingForUser(id_usuario);
            return reply.code(200).send(rating);
        } catch (error) {
            request.log.error(error);
            return reply.code(404).send({
                statusCode: 404,
                error: 'Not Found',
                message: error.message
            });
        }
    }

    async getCompleteTrip(request, reply) {
        try {
            const { codigo_viaje } = request.params;
            const rating = await this.service.findTripCompleted(codigo_viaje);
            return reply.code(200).send(rating);
        } catch (error) {
            request.log.error(error);
            return reply.code(404).send({
                statusCode: 404,
                error: 'Not Found',
                message: error.message
            });
        }
    }
}
