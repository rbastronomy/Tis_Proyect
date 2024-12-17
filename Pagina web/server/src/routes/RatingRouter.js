import { BaseRouter } from "../core/BaseRouter.js";
import RatingController from "../controllers/RatingController.js";

/**
 * Router for rating-related endpoints
 * @extends {BaseRouter}
 */
export class RatingRouter extends BaseRouter {
    /**
     * Initialize rating router
     * @param {import('fastify').FastifyInstance} fastify - Fastify instance
     */
    constructor(provider) {
        super(provider, '/api/ratings');
        this.controller = new RatingController();
        this.setupRoutes();
    }

    /**
     * Setup rating routes
     * @private
     */
    setupRoutes() {
        // Get rating by ID
        this.addRoute('GET', '/:id_valoracion', {
            handler: this.withAuth(
                this.controller.getRating.bind(this.controller),
                ['ver_historial'],
                ['ADMINISTRADOR', 'CLIENTE', 'CONDUCTOR']
            ),
        });

        // Create rating for a trip
        this.addRoute('POST', '/trip/:codigo_viaje', {
            handler: this.withAuth(
                this.controller.createRating.bind(this.controller),
                ['ver_historial'],
                ['CLIENTE']
            ),
        });

        // Update rating
        this.addRoute('PUT', '/:id_valoracion', {
            handler: this.withAuth(
                this.controller.updateRating.bind(this.controller),
                ['ver_historial'],
                ['CLIENTE']
            ),
        });

        // Get ratings by user
        this.addRoute('GET', '/user/:rut', {
            handler: this.withAuth(
                this.controller.getRatingByUser.bind(this.controller),
                ['ver_historial'],
                ['ADMINISTRADOR', 'CLIENTE', 'CONDUCTOR']
            ),
        });

        // Get rating for a trip
        this.addRoute('GET', '/trip/:codigo_viaje', {
            handler: this.withAuth(
                this.controller.getRatingForTrip.bind(this.controller),
                ['ver_historial'],
                ['ADMINISTRADOR', 'CLIENTE', 'CONDUCTOR']
            ),
        });

        // Delete rating
        this.addRoute('DELETE', '/:id_valoracion', {
            handler: this.withAuth(
                this.controller.deleteRating.bind(this.controller),
                ['ver_historial'],
                ['ADMINISTRADOR']
            ),
        });

        // Get completed trips
        this.addRoute('GET', '/viajes/completados', {
            handler: this.withAuth(
                this.controller.getCompleteTrip.bind(this.controller),
                ['ver_historial'],
                ['ADMINISTRADOR', 'CLIENTE', 'CONDUCTOR']
            ),
        });
    }
}