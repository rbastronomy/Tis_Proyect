
export class BaseService {
    constructor(model) {
      this.model = model;
    }
  
    async getAll() {
      return this.model.getAll();
    }
  
    async getById(id) {
      return this.model.getById(id);
    }
  
    async create(data) {
      return this.model.create(data);
    }
  
    async update(id, data) {
      return this.model.update(id, data);
    }
  
    async delete(id) {
      return this.model.delete(id);
    }
  }
  