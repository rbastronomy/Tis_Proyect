import { BaseController } from '../core/BaseController.js';
import { ExampleService } from '../services/ExampleService.js';

export class ExampleController extends BaseController {
  constructor() {
    const service = new ExampleService();
    super(service);
  }

  /**
   * Get paginated examples
   * @param {Object} request - HTTP request object
   * @param {Object} reply - HTTP response object
   * @returns {Promise<void>}
   */
  async getPaginatedExamples(request, reply) {
    try {
      const page = parseInt(request.query.page || 1);
      const pageSize = parseInt(request.query.pageSize || 10);
      
      const result = await this.service.getPaginatedExamples(page, pageSize);
      
      return reply
        .code(200)
        .header('Content-Type', 'application/json')
        .send(result);
    } catch (error) {
      console.error('Controller Error:', error);
      return reply
        .code(500)
        .send({ 
          error: 'Internal Server Error',
          message: error.message 
        });
    }
  }
} 