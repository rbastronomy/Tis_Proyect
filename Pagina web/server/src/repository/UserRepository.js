import { BaseRepository } from '../core/BaseRepository.js';
import { UserModel } from '../models/UserModel.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('persona', UserModel, 'rut');
  }

  /**
   * Formats RUT by removing verification digit and dots, converts to integer
   * @param {string|number} rut - RUT to format
   * @returns {number} Formatted RUT as integer
   * @throws {Error} If RUT format is invalid
   */
  _formatRut(rut) {
    if (!rut) throw new Error('Invalid RUT format: RUT is empty');
    
    // Convert to string if number
    let rutStr = rut.toString();
    
    // Remove any existing dots and dashes
    rutStr = rutStr.replace(/\./g, '').replace(/-/g, '');
    
    // If it's a session ID or already formatted, return as is
    if (rutStr.length > 12) return parseInt(rutStr, 10);
    
    // Validate basic RUT format
    if (!/^\d{7,9}[\dkK]$/.test(rutStr)) {
      throw new Error(`Invalid RUT format: ${rut}`);
    }
    
    // Remove the verification digit
    const numbers = rutStr.slice(0, -1);
    
    // Convert to integer
    return parseInt(numbers, 10);
  }

  _toModel(data) {
    if (!data) return null;
    return new UserModel(data);
  }

  /**
   * Finds a user by email
   * @param {string} email - User email
   * @returns {Promise<UserModel|null>} Found user or null
   */
  async findByEmail(email) {
    try {
      const result = await this.db.select('*')
        .from(this.tableName)
        .where('correo', '=', email)
        .first();
      return this._toModel(result);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Finds a user by RUT
   * @param {string|number} rut - RUT to search for
   * @returns {Promise<UserModel|null>} Found user or null
   */
  async findByRut(rut) {
    try {
      const formattedRut = this._formatRut(rut);
      console.log('Formatted RUT for query:', formattedRut);
      const result = await this.db.select('*')
        .from(this.tableName)
        .where({ rut: formattedRut })
        .first();
      
      console.log('Found user by RUT:', result);
      return this._toModel(result);
    } catch (error) {
      console.error('Error in findByRut:', error);
      if (error.message.includes('Invalid RUT format')) {
        // If it's a session ID, try searching without formatting
        const result = await this.db.select('*')
          .from(this.tableName)
          .where({ rut: rut.toString() })
          .first();
        return this._toModel(result);
      }
      throw error;
    }
  }

  /**
   * Creates a new user
   * @param {Object} userData - User data
   * @returns {Promise<UserModel>} Created user
   */
  async create(userData) {
    try {
      // Verify database connection
      await this.db.raw('SELECT 1');
      
      // Format RUT before insertion
      const formattedRut = this._formatRut(userData.rut);
      
      const dbData = {
        rut: formattedRut, // Use the formatted RUT here
        nombre: userData.nombre,
        correo: userData.correo,
        ntelefono: userData.ntelefono,
        contrasena: userData.contrasena,
        estadop: userData.estadop || 'ACTIVO',
        idroles: userData.idroles || 2
      };

      console.log('Formatted data for DB:', dbData);

      const [insertedId] = await this.db(this.tableName)
        .insert(dbData)
        .returning(['rut']);

      console.log('Inserted RUT:', insertedId.rut);

      // Query using the same formatted RUT we just inserted
      const result = await this.db.select('*')
        .from(this.tableName)
        .where({ rut: formattedRut })
        .first();

      console.log('Found user after insert:', result);
      return this._toModel(result);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === '42P01') {
        throw new Error('Database table not found. Please run migrations.');
      }
      throw error;
    }
  }

  /**
   * Updates user data
   * @param {string} rut - User RUT
   * @param {Object} userData - Updated user data
   * @returns {Promise<UserModel>} Updated user
   */
  async update(rut, userData) {
    try {
      // If updating RUT, format it
      if (userData.rut) {
        userData.rut = this._formatRut(userData.rut);
      }

      const [updatedUser] = await this.db(this.tableName)
        .where({ rut })
        .update(userData)
        .returning('*');

      return this._toModel(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Finds all users with optional filters
   * @param {Object} filters - Optional filters to apply
   * @returns {Promise<UserModel[]>} Array of users
   */
  async findAll(filters = {}) {
    try {
      const results = await this.db.select('*')
        .from(this.tableName)
        .where(filters);

      return results.map(row => this._toModel(row));
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }
}

export default UserRepository;
