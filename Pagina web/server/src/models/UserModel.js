import { BaseModel } from '../core/BaseModel.js';

export class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  async create(data) {
    const { name, email, password } = data;
    return this.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, password]
    );
  }

  async update(id, data) {
    const validFields = ['name', 'email', 'password'];
    const setFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(data)) {
      if (validFields.includes(key)) {
        setFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `UPDATE users SET ${setFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    return this.query(query, values);
  }

  async createWithTransaction(data) {
    return this.transaction(async (trx) => {
      const [user] = await trx(this.tableName).insert(data).returning('*');
      // Add more operations within the transaction if needed
      return user;
    });
  }
}