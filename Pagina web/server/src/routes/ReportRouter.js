import { BaseRouter } from '../core/BaseRouter.js';
import { ReportController } from '../controllers/ReportController.js';

/**
 * Router para el manejo de reportes
 * @extends {BaseRouter}
 */
export class ReportRouter extends BaseRouter {
  /**
   */
  constructor(provider) {
    super(provider, '/api/reports');
    
    this.reportController = new ReportController();
    this.setupRoutes();
  }

  setupRoutes() {
    // Ruta para generar reportes
    this.addRoute('POST', '/', {
      schema: {
        body: {
          type: 'object',
          required: ['type'],
          properties: {
            type: { 
              type: 'string', 
            },
            filters: {
              type: 'object',
              properties: {
                fecha_between: {
                  type: 'array',
                  items: { 
                    type: 'string',
                    format: 'date-time'
                  },
                  minItems: 2,
                  maxItems: 2
                }
              }
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { 
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  data: { type: 'array' },
                  generatedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      },
      handler: this.withAuth(
        this.reportController.generateReport.bind(this.reportController),
        ['generate_reports'],
        ['ADMINISTRADOR']
      )
    });
  }
}

export default ReportRouter;