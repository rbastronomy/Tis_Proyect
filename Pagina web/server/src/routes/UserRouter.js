import { BaseRouter } from '../core/BaseRouter.js';
import { UserController } from '../controllers/UserController.js';

/**
 * Router for user related endpoints
 * @class UserRouter
 * @extends BaseRouter
 */
export class UserRouter extends BaseRouter {
  /**
   * @param {Object} provider - The HTTP server provider instance
   */
  constructor(provider) {
    super(provider, '/api/users');
    this.controller = new UserController();
    this.setupRoutes();
  }

  setupRoutes() {
    
    // 1. Ruta paginada (para tablas o listas largas)
    this.addRoute('GET', '/', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            pageSize: { type: 'integer', minimum: 1, default: 10 },
            orderBy: { type: 'string' },
            order: { type: 'string', enum: ['asc', 'desc'] }
          }
        }
      },
      handler: this.withAuth(
        this.controller.getPaginated.bind(this.controller),
        [],
        ['ADMINISTRADOR']
      )
    });

    /*
    this.addRoute('GET', '/', {
      handler: this.withAuth(
        this.controller.getAll.bind(this.controller),
        [],
        ['admin']
      )
    });
    */

    // 3. Búsqueda específica con filtros
    this.provider.get('/search', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            role: { type: 'string' },
            status: { type: 'string' },
            // otros filtros...
          }
        }
      },
      handler: this.withAuth(
        async (request, reply) => {
          const filters = request.query;
          const data = await this.controller.getAll(filters);
          return reply.send(data);
        },
        [],
        ['ADMINISTRADOR']
      )
    });

    this.addRoute('GET', '/:userId', {
      handler: this.withSession(async (request, reply) => {
        const { userId } = request.params;
        
        // Special case - allow admin or self
        if (!request.user.roles.includes('admin') && request.user.rut !== parseInt(userId)) {
          throw { statusCode: 403, message: 'Forbidden: Insufficient permissions' };
        }
        
        return this.controller.getUserDetails(request, reply);
      })
    });

    this.addRoute('POST', '/', {
      handler: this.withSession(
        this.withPermissions(
          this.controller.create.bind(this.controller),
          ['create_user'],
          []
        )
      )
    });

    // Add new route to get all drivers
    this.addRoute('GET', '/drivers', {
      handler: this.withAuth(
        async (request, reply) => {
          return this.controller.getDrivers(request, reply);
        },
        [],
        ['ADMINISTRADOR']
      )
    });

    // Add delete driver endpoint
    this.addRoute('DELETE', '/drivers/:rut', {
      handler: this.withAuth(
        async (request, reply) => {
          return this.controller.deleteDriver(request, reply);
        },
        [],
        ['ADMINISTRADOR']
      )
    });
  }
} 