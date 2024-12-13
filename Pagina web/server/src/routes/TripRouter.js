import { BaseRouter } from '../core/BaseRouter.js';
import { TripController } from '../controllers/TripController.js';

/**
 * Router for trip related endpoints
 * @class TripRouter
 * @extends BaseRouter
 */
export class TripRouter extends BaseRouter {
    /**
   * @param {Object} provider - The HTTP server provider instance
   */
  constructor(provider) {
    super(provider, '/api/trips');
    this.controller = new TripController();
    this.setupRoutes();
  }

  setupRoutes() {
    this.addRoute('POST', '/', {
      handler: this.withAuth(
        this.controller.create.bind(this.controller),
        this.controller.create.bind(this.controller),
      ),
    });
    this.addRoute('GET', '/history', {
      handler: this.withAuth(
        this.controller.getTripsByUser.bind(this.controller),
        this.controller.getTripsByUser.bind(this.controller),
      ),
    });
    this.addRoute('GET', '/driver/trips', {
      handler: this.withAuth(
        this.controller.getTripsByDriver.bind(this.controller),
        this.controller.getTripsByDriver.bind(this.controller),
      ),
    });
    this.addRoute('GET', '/:id', {
      handler: this.withAuth(
        this.controller.getTripById.bind(this.controller),
        this.controller.getTripById.bind(this.controller),
      ),
    });
  }
}

