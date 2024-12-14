import { BaseRepository } from '../core/BaseRepository.js';
import { UserModel } from '../models/UserModel.js';
import { RoleModel } from '../models/RoleModel.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super('persona', 'rut');
  }

  /**
   * Formats RUT by removing verification digit and dots, converts to integer
   * @param {string|number} rut - RUT to format
   * @returns {number} Formatted RUT as integer
   * @throws {Error} If RUT format is invalid
   */
  _formatRut(rut) {
    if (!rut) throw new Error('Invalid RUT format: RUT is empty');
    
    let rutStr = rut.toString().replace(/\./g, '').replace(/-/g, '');
    
    // If it's already a number without verification digit, return as is
    if (/^\d{7,8}$/.test(rutStr)) {
      return parseInt(rutStr, 10);
    }
    
    // Validate RUT format (7-8 digits + verifier)
    if (!/^\d{7,8}[\dkK]$/.test(rutStr)) {
      throw new Error(`Invalid RUT format: ${rut}`);
    }
    
    // Always remove last digit (verifier)
    const numbers = rutStr.slice(0, -1);
    console.log('RUT before format:', rut, 'After format:', numbers);
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
    console.log('findByEmail', email);
    try {
      const userData = await this.db.select('*')
        .from(this.tableName)
        .where('correo', '=', email)
        .whereNull('deleted_at_persona')
        .first();
      return userData
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
        .whereNull('deleted_at_persona')
        .first();
      
      console.log('Found user by RUT:', result);
      return this._toModel(result);
    } catch (error) {
      console.error('Error in findByRut:', error);
      if (error.message.includes('Invalid RUT format')) {
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
      // Format RUT by removing verification digit
      const formattedRut = this._formatRut(userData.rut);
      console.log('Creating user with formatted RUT:', formattedRut); // Debug log
      
      const dbData = {
        rut: formattedRut, // This will be the RUT without verifier digit
        nombre: userData.nombre,
        apellido_paterno: userData.apellido_paterno,
        apellido_materno: userData.apellido_materno,
        fecha_nacimiento: userData.fecha_nacimiento,
        correo: userData.correo,
        telefono: userData.telefono,
        nacionalidad: userData.nacionalidad,
        genero: userData.genero,
        contrasena: userData.contrasena,
        estado_persona: userData.estado_persona || 'ACTIVO',
        id_roles: userData.id_roles || 2,
        fecha_contratacion: userData.fecha_contratacion,
        licencia_conducir: userData.licencia_conducir,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const [insertedId] = await this.db(this.tableName)
        .insert(dbData)
        .returning(['rut']);

      console.log('Inserted RUT:', insertedId.rut);

      const userDB = await this.db.select('*')
        .from(this.tableName)
        .where({ rut: formattedRut }) // Use the formatted RUT here too
        .first();

      console.log('Found user after insert:', userDB);
      return userDB;
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
      if (userData.rut) {
        userData.rut = this._formatRut(userData.rut);
      }

      userData.updated_at = new Date();

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
   * Soft deletes a user by setting deleted_at_persona timestamp
   * @param {string|number} rut - User RUT
   * @returns {Promise<Object|null>} Deleted user data or null
   */
  async softDelete(rut) {
    try {
      const formattedRut = this._formatRut(rut);
      console.log('Attempting to delete user with RUT:', formattedRut); // Debug log
      
      // First check if user exists and is not deleted
      const existingUser = await this.db(this.tableName)
        .where({ rut: formattedRut })
        .whereNull('deleted_at_persona')
        .first();

      if (!existingUser) {
        console.log('User not found or already deleted'); // Debug log
        return null;
      }

      const [deletedUser] = await this.db(this.tableName)
        .where({ rut: formattedRut })
        .whereNull('deleted_at_persona')
        .update({
          estado_persona: 'ELIMINADO',
          deleted_at_persona: new Date(),
          updated_at: new Date()
        })
        .returning(['rut', 'nombre', 'estado_persona', 'deleted_at_persona']); // Specify which fields to return

      console.log('Delete operation result:', deletedUser); // Debug log
      return deletedUser || null;
    } catch (error) {
      console.error('Error soft deleting user:', error);
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
      const query = this.db.select('*')
        .from(this.tableName)
        .whereNull('deleted_at_persona'); // Only get non-deleted users

      if (filters.estado_persona) {
        query.where('estado_persona', filters.estado_persona);
      }

      if (filters.id_roles) {
        query.where('id_roles', filters.id_roles);
      }

      const results = await query;
      return results;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  /**
   * Finds user with full details including role
   * @param {string} rut - User RUT
   * @returns {Promise<UserModel|null>} User with details or null
   */
  async findWithDetails(rut) {
    try {
      const result = await this.db(this.tableName)
        .select(
          'persona.*',
          'roles.nombre_rol',
          'roles.descripcion_rol'
        )
        .leftJoin('roles', 'persona.id_roles', 'roles.id_roles')
        .where('persona.rut', rut)
        .first();

      return result ? this._toModel(result) : null;
    } catch (error) {
      console.error('Error finding user with details:', error);
      throw error;
    }
  }

  /**
   * Find one user with filters
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Object|null>} User data or null
   */
  async findOne(filters) {
    try {
      const queryFilters = { ...filters };
      
      // Format RUT if present in filters, but don't remove verifier digit again
      // since it was already removed during creation
      if (queryFilters.rut) {
        // Just convert to integer without removing any digits
        queryFilters.rut = parseInt(queryFilters.rut.toString().replace(/\./g, '').replace(/-/g, ''));
      }

      console.log('Finding user with filters:', queryFilters);

      const result = await this.db(this.tableName)
        .where(queryFilters)
        .whereNull('deleted_at_persona')
        .first();
      
      console.log('Found user:', result);
      return result || null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  /**
   * Finds available drivers by their RUTs in bulk
   * @param {Array<number>} ruts - Array of driver RUTs
   * @param {Date} [bookingTime=new Date()] - The time of the booking
   * @returns {Promise<Object>} Map of RUT to driver data
   */
  async findDriversByRuts(ruts, bookingTime = new Date()) {
    try {
      if (!ruts || ruts.length === 0) return {};

      const formattedRuts = ruts.map(rut => this._formatRut(rut));
      const bufferTime = 60; // 60 minutes buffer
      
      // Ensure bookingTime is a Date object and format for PostgreSQL
      const bookingDate = bookingTime instanceof Date ? bookingTime : new Date(bookingTime);
      const formattedBookingTime = bookingDate.toISOString();

      console.log('UserRepository - Booking Time:', {
        originalTime: bookingTime,
        formattedTime: formattedBookingTime,
        isDefault: bookingTime.getTime() === new Date().getTime(),
        bufferTime
      });
      
      // Get drivers excluding those who have overlapping bookings
      const drivers = await this.db
        .select(
          'persona.*',
          'roles.id_roles',
          'roles.nombre_rol',
          'roles.descripcion_rol'
        )
        .from(this.tableName)
        .leftJoin('roles', 'persona.id_roles', 'roles.id_roles')
        .whereIn('persona.rut', formattedRuts)
        .where('persona.id_roles', 3)
        .whereNull('persona.deleted_at_persona')
        // Exclude drivers with overlapping bookings
        .whereNotExists(function() {
          this.select('*')
            .from('reserva')
            .whereRaw('reserva.rut_conductor = persona.rut')
            .whereIn('estado_reserva', ['PENDIENTE', 'EN_CAMINO'])
            .whereRaw(`fecha_reserva BETWEEN (?::timestamp - INTERVAL '${bufferTime} minutes') AND (?::timestamp + INTERVAL '${bufferTime} minutes')`, 
              [formattedBookingTime, formattedBookingTime]);
        });

      return drivers.reduce((map, driver) => {
        const driverModel = this._toModel(driver);
        driverModel.role = new RoleModel({
          id_roles: driver.id_roles,
          nombre_rol: driver.nombre_rol,
          descripcion_rol: driver.descripcion_rol,
          estado_rol: 'ACTIVO'
        });
        map[driver.rut] = driverModel;
        return map;
      }, {});
    } catch (error) {
      console.error('Error finding drivers by RUTs:', error);
      throw error;
    }
  }
}

export default UserRepository;
