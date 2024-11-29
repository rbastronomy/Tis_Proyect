import { BaseRouter } from '../core/BaseRouter.js';
import { MapsController } from '../controllers/MapController.js';

/**
 * Router for map related endpoints
 * @class MapRouter
 * @extends BaseRouter
 */
export class MapRouter extends BaseRouter {
  /**
   * @param {Object} provider - The HTTP server provider instance
   */
  constructor(provider) {
    super(provider, '/api/maps');
    this.controller = new MapsController();
    this.setupRoutes();
  }

  setupRoutes() {
    this.addRoute('GET', '/directions', {
      schema: {
        querystring: {
          type: 'object',
          required: ['origin', 'destination'],
          properties: {
            origin: { type: 'string' },
            destination: { type: 'string' }
          }
        }
      },
      handler: this.withErrorHandler(
        this.controller.getDirections.bind(this.controller)
      )
    });
  }
} 