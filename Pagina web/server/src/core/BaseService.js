
export class BaseService {
  /**
   * @param {class} repository - Repository class
   */
    constructor(repository) {
      this.repository = repository;
    }
  
    async getAll(filters = {}, options = {}) {
      const data = await this.repository.findAll(filters, options);
      return data.map(this._toModel);
    }
  
    async getById(id) {
      const data = await this.repository.findById(id);
      return this._toModel(data);
    }
  
    async create(data) {
      const newRecord = await this.repository.create(data);
      return this._toModel(newRecord);
    }
  
    async update(id, data) {
      const updated = await this.repository.update(id, data);
      return this._toModel(updated);
    }
  
    async delete(id) {
      return this.repository.delete(id);
    }
  
    /**
   * Obtiene registros paginados
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
    async findWherePaginated(conditions, options = {}) {
      return await this.repository.findWhere(conditions, {
        page: options.page || 1,
        pageSize: options.pageSize || 10,
        orderBy: options.orderBy || 'created_at',
        orderDirection: options.orderDirection || 'desc'
      });
    }
  
    async count(filters = {}) {
      return this.repository.count(filters);
    }
  }
  