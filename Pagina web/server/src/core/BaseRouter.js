import { AuthMiddleware } from '../middleware/authMiddleware.js';

/**
 * Base router class that provides common functionality for all routers
 * @class BaseRouter
 */
export class BaseRouter {
  /**
   * @param {Object} provider - The HTTP server provider instance (e.g., Fastify)
   * @param {string} prefix - Route prefix (e.g., '/api/auth')
   */
  constructor(provider, prefix = '') {
    this.provider = provider;
    this.prefix = prefix;
    this.routes = [];
  }

  /**
   * Registers a route with the provider instance
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} path - Route path
   * @param {Object} options - Route options (schema, handler, etc.)
   */
  addRoute(method, path, options) {
    const fullPath = this.prefix + path;
    this.routes.push({ method, path: fullPath, options });
  }

  /**
   * Registers all routes with the provider instance
   */
  registerRoutes() {
    this.routes.forEach(({ method, path, options }) => {
      const fullPath = `${this.prefix}${path}`;
      console.log(`Registering route: ${method} ${fullPath}`);

      this.provider[method.toLowerCase()](path, options);
    });
  }

  /**
   * Helper method to wrap a handler with error handling
   * @param {Function} handler - Route handler function
   */
  withErrorHandler(handler) {
    return async (request, reply) => {
      try {
        return await handler(request, reply);
      } catch (error) {
        request.log.error(error);
        return reply
          .status(error.statusCode || 500)
          .send({ error: error.message || 'Internal server error' });
      }
    };
  }

  /**
   * Helper method to verify session
   * @param {Function} handler - Route handler function
   */
  withSession(handler) {
    return async (request, reply) => {
      try {
        const user = await AuthMiddleware.verifySession(request);
        request.user = user; // Attach user to request for later use
        return await handler(request, reply);
      } catch (error) {
        return reply
          .status(error.statusCode || 401)
          .send({ error: error.message || 'Unauthorized' });
      }
    };
  }

  /**
   * Helper method to check permissions
   * @param {Function} handler - Route handler function
   * @param {Array} permissions - Required permissions
   * @param {Array} roles - Required roles
   */
  withPermissions(handler, permissions = [], roles = []) {
    return async (request, reply) => {
      try {
        if (!request.user) {
          throw { statusCode: 401, message: 'No session found' };
        }
        AuthMiddleware.validatePermissions(request.user, permissions, roles);
        return await handler(request, reply);
      } catch (error) {
        return reply
          .status(error.statusCode || 403)
          .send({ error: error.message || 'Forbidden' });
      }
    };
  }

  /**
   * Combines session verification and permission checking
   * @param {Function} handler - Route handler function
   * @param {Array} permissions - Required permissions
   * @param {Array} roles - Required roles
   */
  withAuth(handler, permissions = [], roles = []) {
    return this.withSession(
      this.withPermissions(handler, permissions, roles)
    );
  }

  /**
   * Registra una ruta GET para obtener datos paginados
   * @param {string} path - Ruta base (ej: '/users')
   * @param {Object} options - Opciones de la ruta
   */
  registerPaginatedRoute(path, controller) {
    const fullPath = this.prefix + path;
    
    this.provider.get(fullPath, {
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
      handler: this.withErrorHandler(controller.getPaginated.bind(controller))
    });
  }

  registerCrudRoutes(path, controller) {
    const fullPath = this.prefix + path;

    // GET /resource (paginado)
    this.registerPaginatedRoute(path, controller);

    // GET /resource/:id
    this.provider.get(`${fullPath}/:id`, {
      handler: this.withErrorHandler(controller.getById.bind(controller))
    });

    // POST /resource
    this.provider.post(fullPath, {
      handler: this.withErrorHandler(controller.create.bind(controller))
    });

    // PUT /resource/:id
    this.provider.put(`${fullPath}/:id`, {
      handler: this.withErrorHandler(controller.update.bind(controller))
    });

    // DELETE /resource/:id
    this.provider.delete(`${fullPath}/:id`, {
      handler: this.withErrorHandler(controller.delete.bind(controller))
    });
  }

  registerProtectedCrudRoutes(path, controller, permissions = [], roles = []) {
    const fullPath = this.prefix + path;

    // GET /resource (paginado)
    this.provider.get(fullPath, {
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
        controller.getPaginated.bind(controller),
        permissions,
        roles
      )
    });

    // Otras rutas CRUD protegidas...
    // ... (similar a registerCrudRoutes pero con withAuth)
  }

}