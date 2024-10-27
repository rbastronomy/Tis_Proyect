import { db } from '../db/database.js';

export class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = db;
  }

  async getAll() {
    return this.db(this.tableName).select('*');
  }

  async getById(id) {
    return this.db(this.tableName).where({ id }).first();
  }

  async create(data) {
    return this.db(this.tableName).insert(data).returning('*');
  }

  async update(id, data) {
    return this.db(this.tableName).where({ id }).update(data).returning('*');
  }

  async delete(id) {
    return this.db(this.tableName).where({ id }).del();
  }

  async transaction(callback) {
    return this.db.transaction(callback);
  }
}