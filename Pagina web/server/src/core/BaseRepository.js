import { db } from '../db/database.js';

export class BaseRepository {
  /**
   * @param {string} tableName - Nombre de la tabla en la base de datos
   * @param {class} ModelClass - Clase del modelo a utilizar para las instancias
   * @param {string} primaryKey - Nombre de la columna ID
   */
  constructor(tableName, ModelClass, primaryKey = 'id') {
    this.tableName = tableName;
    this.ModelClass = ModelClass;
    this.primaryKey = primaryKey;
    this.db = db;
  }

  /**
   * Convierte datos de la DB al modelo correspondiente
   * @param {Object} data - Datos crudos de la base de datos
   * @returns {Object|null} - Instancia del modelo o null
   * @protected
   */
  _toModel(data) {
    if (!data) return null;
    return new this.ModelClass(data);
  }

  /**
   * Encuentra un registro por ID
   * @param {string|number} id - Identificador del registro
   * @returns {Promise<Object|null>} - Instancia del modelo o null
   */
  async findById(id) {
    try {
      const result = await this.db(this.tableName)
        .where(this.primaryKey, id)
        .first();
      return this._toModel(result);
    } catch (error) {
      throw new Error(`Error al buscar por ID en ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Encuentra todos los registros que coincidan con los filtros
   * @param {Object} filters - Filtros a aplicar
   * @returns {Promise<Array>} - Array de instancias del modelo
   */
  async findAll(filters = {}) {
    try {
      const results = await this.db(this.tableName)
        .where(filters)
        .select('*');
      return results.map(result => this._toModel(result));
    } catch (error) {
      throw new Error(`Error al buscar todos en ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo registro
   * @param {Object} data - Datos a insertar
   * @returns {Promise<Object>} - Instancia del modelo creado
   */
  async create(data) {
    try {
      const [id] = await this.db(this.tableName)
        .insert(data)
        .returning(this.primaryKey);
      return id;
    } catch (error) {
      throw new Error(`Error al crear en ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Actualiza un registro existente
   * @param {string|number} id - Identificador del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Instancia del modelo actualizado
   */
  async update(id, data) {
    try {
      const [updated] = await this.db(this.tableName)
        .where(this.primaryKey, id)
        .update(data)
        .returning('*');
      return this._toModel(updated);
    } catch (error) {
      throw new Error(`Error al actualizar en ${this.tableName}: ${error.message}`);
    }
  }

  // Método genérico para eliminar un registro
  async delete(id) {
    try {
      await this.db(this.tableName)
        .where(this.primaryKey, id)
        .delete();
    } catch (error) {
      throw new Error(`Error al eliminar en ${this.tableName}: ${error.message}`);
    }
  }

  // Método genérico para realizar una operación de soft delete
  async softDelete(id, idColumn = 'deleted_at') {
    try {
      return await this.db(this.tableName)
        .where(this.primaryKey, id)
        .update({
          [idColumn]: new Date(),
          active: false
        });
    } catch (error) {
      throw new Error(`Error al realizar soft delete en ${this.tableName}: ${error.message}`);
    }
  }

  // Método para transacciones
  async transaction(callback) {
    return await this.db.transaction(async (trx) => {
      return await callback(trx);
    });
  }

  // Método para búsqueda con condiciones complejas
  async findWhere(conditions, options = {}) {
    try {
      let query = this.db(this.tableName);

      // Agregar condiciones
      Object.entries(conditions).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.whereIn(key, value);
        } else if (value === null) {
          query = query.whereNull(key);
        } else {
          query = query.where(key, value);
        }
      });

      // Opcional: Paginación
      if (options.page && options.pageSize) {
        const page = options.page > 0 ? options.page : 1;
        const pageSize = options.pageSize;
        query = query
          .limit(pageSize)
          .offset((page - 1) * pageSize);
      }

      // Opcional: Ordenamiento
      if (options.orderBy) {
        query = query.orderBy(options.orderBy, options.order || 'asc');
      }

      return await query;
    } catch (error) {
      throw new Error(`Error en búsqueda compleja en ${this.tableName}: ${error.message}`);
    }
  }

  // Método para contar registros
  async count(filters = {}) {
    try {
      const [result] = await this.db(this.tableName)
        .where(filters)
        .count('* as total');

      return parseInt(result.total, 10);
    } catch (error) {
      throw new Error(`Error al contar registros en ${this.tableName}: ${error.message}`);
    }
  }
}
