export class BaseService {
    constructor(repository) {
      this.repository = repository;
    }
  
    async getAll(filters = {}, options = {}) {
      return this.repository.findAll(filters, options);
    }
  
    async getById(id) {
      return this.repository.findById(id);
    }
  
    async create(data) {
      return this.repository.create(data);
    }
  
    async update(id, data) {
      return this.repository.update(id, data);
    }
  
    async delete(id) {
      return this.repository.delete(id);
    }
  
    async findWhere(conditions, options = {}) {
      return this.repository.findWhere(conditions, options);
    }
  
    async count(filters = {}) {
      return this.repository.count(filters);
    }
  }
  