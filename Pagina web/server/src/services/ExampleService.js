import { BaseService } from '../core/BaseService.js';
import { ExampleModel } from '../models/ExampleModel.js';
import { ExampleRepository } from '../repository/ExampleRepository.js';

export class ExampleService extends BaseService {
  constructor() {
    const repository = new ExampleRepository();
    super(ExampleModel, repository);
  }

  /**
   * Get paginated examples
   * @param {number} page - Current page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async getPaginatedExamples(page, pageSize) {
    try {
      const result = await this.repository.findPaginated(page, pageSize);
      const modelInstances = result.data.map(item => new this.Model(item));

      return {
        data: modelInstances,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Service Error:', error);
      throw error;
    }
  }

  /**
   * Find examples with conditions
   * @param {Object} conditions - Search conditions
   * @param {Object} options - Pagination options
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async findExamples(conditions, options) {
    const result = await this.repository.findWhere(conditions, options);
    const modelInstances = result.data.map(item => new this.Model(item));

    return {
      data: modelInstances,
      pagination: result.pagination
    };
  }
} 