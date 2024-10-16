import { BaseModel } from '../core/BaseModel.js';

export class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  // Use inherited create method from BaseModel
  async create(data) {
    return super.create(data);
  }

  // Use inherited update method from BaseModel
  async update(id, data) {
    return super.update(id, data);
  }

  // Custom method for creating a user with a transaction
  async createWithTransaction(data) {
    return this.transaction(async (trx) => {
      const [user] = await trx(this.tableName).insert(data).returning('*');
      // Add more operations within the transaction if needed
      return user;
    });
  }
}