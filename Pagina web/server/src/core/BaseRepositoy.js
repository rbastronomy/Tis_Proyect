const knex = require('../config/database');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.knex = knex;
  }

  // Método genérico para encontrar por ID
  async findById(id, idColumn = 'id') {
    try {
      return await this.knex(this.tableName)
        .where(idColumn, id)
        .first();
    } catch (error) {
      throw new Error(`Error al buscar por ID en ${this.tableName}: ${error.message}`);
    }
  }

  // Método genérico para encontrar todos los registros
  async findAll(filters = {}, options = {}) {
    try {
      let query = this.knex(this.tableName).where(filters);

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
      throw new Error(`Error al recuperar registros de ${this.tableName}: ${error.message}`);
    }
  }

  // Método genérico para crear un registro
  async create(data) {
    try {
      // Eliminar campos undefined
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
      );

      const [insertedId] = await this.knex(this.tableName)
        .insert(cleanData)
        .returning('id');

      return insertedId;
    } catch (error) {
      throw new Error(`Error al crear registro en ${this.tableName}: ${error.message}`);
    }
  }

  // Método genérico para actualizar un registro
  async update(id, data, idColumn = 'id') {
    try {
      // Eliminar campos undefined
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
      );

      return await this.knex(this.tableName)
        .where(idColumn, id)
        .update(cleanData);
    } catch (error) {
      throw new Error(`Error al actualizar registro en ${this.tableName}: ${error.message}`);
    }
  }

  // Método genérico para eliminar un registro
  async delete(id, idColumn = 'id') {
    try {
      return await this.knex(this.tableName)
        .where(idColumn, id)
        .del();
    } catch (error) {
      throw new Error(`Error al eliminar registro en ${this.tableName}: ${error.message}`);
    }
  }

  // Método genérico para realizar una operación de soft delete
  async softDelete(id, idColumn = 'id', deletedAtColumn = 'deleted_at') {
    try {
      return await this.knex(this.tableName)
        .where(idColumn, id)
        .update({
          [deletedAtColumn]: new Date(),
          active: false
        });
    } catch (error) {
      throw new Error(`Error al realizar soft delete en ${this.tableName}: ${error.message}`);
    }
  }

  // Método para transacciones
  async transaction(callback) {
    return await this.knex.transaction(async (trx) => {
      try {
        return await callback(trx);
      } catch (error) {
        throw error;
      }
    });
  }

  // Método para búsqueda con condiciones complejas
  async findWhere(conditions, options = {}) {
    try {
      let query = this.knex(this.tableName);

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
      const [result] = await this.knex(this.tableName)
        .where(filters)
        .count('* as total');

      return parseInt(result.total, 10);
    } catch (error) {
      throw new Error(`Error al contar registros en ${this.tableName}: ${error.message}`);
    }
  }
}

module.exports = BaseRepository;