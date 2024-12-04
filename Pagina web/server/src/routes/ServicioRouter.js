import { BaseRouter } from '../core/BaseRouter.js';
import { ServicioController } from '../controllers/ServicioController.js';

export class ServicioRouter extends BaseRouter {
  constructor(provider) {
    super(provider, '/api/servicios');
    this.controller = new ServicioController();
    this.setupRoutes();
  }

  setupRoutes() {
    // Get active services
    this.addRoute('GET', '/', {
      handler: this.controller.getActiveServices.bind(this.controller)
    });

    // Admin routes with authentication
    this.addRoute('POST', '/', {
      schema: {
        body: {
          type: 'object',
          required: ['tipo', 'descripciont', 'id'],
          properties: {
            tipo: { type: 'string' },
            descripciont: { type: 'string' },
            id: { type: 'integer' }
          }
        }
      },
      handler: this.withAuth(
        this.controller.create.bind(this.controller),
        ['gestionar_servicios'],
        ['ADMINISTRADOR']
      )
    });
  }
} 