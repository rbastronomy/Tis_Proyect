import { BaseRouter } from '../core/BaseRouter.js';
import { ExampleController } from '../controllers/ExampleController.js';


/**
 * Router for example related endpoints
 * @class ExampleRouter
 * @extends BaseRouter
 */
export class ExampleRouter extends BaseRouter {
  /**
   * @param {Object} provider - The HTTP server provider instance
   */
  constructor(provider) {
    super(provider, '/api/examples');
    this.controller = new ExampleController();
    this.setupRoutes();
  }

  setupRoutes() {
    // Ruta de prueba simple
    this.addRoute('GET', '/test', {
      handler: (request, reply) => {
        return reply
          .code(200)
          .header('Content-Type', 'application/json')
          .send({ 
            message: 'Test endpoint working!',
            method: request.method,
            url: request.url
          });
      }
    });

    // Ruta principal
    this.addRoute('GET', '', {
      handler: async (request, reply) => {
        try {
          // Extraer parámetros de la query
          const page = parseInt(request.query.page || '1');
          const pageSize = parseInt(request.query.pageSize || '10');

          // Datos de ejemplo directamente en el router (temporalmente)
          const total = 100;
          const totalPages = Math.ceil(total / pageSize);
          const start = (page - 1) * pageSize;
          
          const data = Array.from({ length: pageSize }, (_, i) => ({
            id: start + i + 1,
            name: `Example ${start + i + 1}`,
            email: `example${start + i + 1}@example.com`,
            status: i % 2 === 0 ? 'Active' : 'Inactive',
            description: `Description ${start + i + 1}`
          })).filter((_, index) => start + index < total);

          return {
            data,
            pagination: {
              page,
              pageSize,
              total,
              totalPages
            }
          };
        } catch (error) {
          console.error('Router Error:', error);
          return reply.status(500).send({ 
            error: 'Internal Server Error',
            message: error.message,
            stack: error.stack // Solo para desarrollo
          });
        }
      }
    });
  }
}