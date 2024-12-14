import { BaseRouter } from "../core/BaseRouter.js";
import RatingController from "../controllers/RatingController.js";

export class RatingRouter extends BaseRouter {
    constructor(provider) {
        super(provider, '/api/ratings');
        this.controller = new RatingController();
        this.setupRoutes();
    }

    setupRoutes() {
        this.addRoute('GET', '/:id_valoracion', {
            handler: this.withAuth(
                this.controller.getRating.bind(this.controller),
                this.controller.getRating.bind(this.controller),
            ),
        });
        this.addRoute('POST', '/', {
            handler: this.withAuth(
                this.controller.createRating.bind(this.controller),
                this.controller.createRating.bind(this.controller),
            ),
        });
        this.addRoute('PUT', '/:id_valoracion', {
            handler: this.withAuth(
                this.controller.updateRating.bind(this.controller),
                this.controller.updateRating.bind(this.controller),
            ),
        });
        this.addRoute('GET', '/user/:rut', {
            handler: this.withAuth(
                this.controller.getRatingByUser.bind(this.controller),
                this.controller.getRatingByUser.bind(this.controller),
            ),
        });
        this.addRoute('GET', '/trip/:codigo_viaje', {
            handler: this.withAuth(
                this.controller.getRatingForTrip.bind(this.controller),
                this.controller.getRatingForTrip.bind(this.controller),
            ),
        });
        this.addRoute('DELETE', '/:id_valoracion', {
            handler: this.withAuth(
                this.controller.deleteRating.bind(this.controller),
                this.controller.deleteRating.bind(this.controller),
            ),
        });
        this.addRoute('GET', '/viajes/completados', {
            handler: this.withAuth(
                this.controller.getCompleteTrip.bind(this.controller),
                this.controller.getCompleteTrip.bind(this.controller),
            ),
        });
    }
}