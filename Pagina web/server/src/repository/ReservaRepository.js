import { BaseRepository } from '../core/BaseRepository.js';
import { ReservaModel } from '../models/ReservaModel.js';

export class ReservaRepository extends BaseRepository {
  constructor() {
    super('reserva', ReservaModel, 'codigoreserva');
  }

  async createReserva(reserva) {
    try {
      const[created] = await this.db(this.tableName)
        .insert(reserva)
        .returning('*');
      return created;
    } catch (error) {
      throw new Error(`Error creando reserva: ${error.message}`);
    }
  }

  async updateReserva(codigoreserva, reserva) {
    try {
      const [updated] = await this.db(this.tableName)
        .where('codigoreserva', codigoreserva)
        .update(reserva)
        .returning('*');
      return updated;
    } catch (error) {
      throw new Error(`Error actualizando reserva: ${error.message}`);
    }
  }

  async findById(codigoreserva) {
    try {
      const result = await this.db(this.tableName)
        .where('codigoreserva', codigoreserva)
        .first();
      return ReservaModel.fromDB(result);
    } catch (error) {
      throw new Error(`Error buscando reserva por ID: ${error.message}`);
    }
  }

  async findByViaje(codigo) {
    try {
      const result = await this.db(this.tableName)
      .where('codigo', codigo)
      .first();
    return  ReservaModel.fromDB(result);
    } catch (error) {
      throw new Error(`Error buscando reserva por viaje: ${error.message}`);
    }
  }

  /**
   * Find reservas with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered reservas
   */
  async findWithFilters(filters) {
    try {
      // First get the reservas with service info
      const query = this.db(this.tableName)
        .distinct('reserva.*', 'servicio.tipo as servicio_tipo', 'servicio.descripciont as servicio_descripcion')
        .leftJoin('solicita', 'reserva.codigoreserva', 'solicita.codigoreserva')
        .leftJoin('servicio', 'solicita.codigos', 'servicio.codigos')
        .whereNull('reserva.deletedatre');

      if (filters.estados) {
        query.where('reserva.estados', filters.estados);
      }

      if (filters.fecha) {
        query.where('reserva.freserva', filters.fecha);
      }

      if (filters.userId) {
        query.where('reserva.rut_conductor', filters.userId);
      }

      const reservas = await query;

      // Get tariffs for each reserva
      const reservasWithTariffs = await Promise.all(
        reservas.map(async (reserva) => {
          // Get the tariff for this specific reserva
          const tariffQuery = await this.db('tarifa')
            .select('tarifa.precio', 'tarifa.descripciont', 'tarifa.tipo')
            .join('servicio_tarifa', 'tarifa.id', 'servicio_tarifa.tarifa_id')
            .join('solicita', 'servicio_tarifa.servicio_id', 'solicita.codigos')
            .where('solicita.codigoreserva', reserva.codigoreserva)
            .first();

          // Transform the flat result into a structured object
          const reservaData = {
            ...reserva,
            servicio: reserva.servicio_tipo ? {
              tipo: reserva.servicio_tipo,
              descripciont: reserva.servicio_descripcion
            } : null,
            tarifa: tariffQuery ? {
              precio: tariffQuery.precio,
              descripciont: tariffQuery.descripciont,
              tipo: tariffQuery.tipo
            } : null
          };

          // Remove the flattened fields
          delete reservaData.servicio_tipo;
          delete reservaData.servicio_descripcion;

          return ReservaModel.fromDB(reservaData);
        })
      );

      return reservasWithTariffs;
    } catch (error) {
      throw new Error(`Error finding reservas with filters: ${error.message}`);
    }
  }

  /**
   * Find reservas by status
   * @param {string} status - Status to filter by
   * @returns {Promise<Array>} Filtered reservas
   */
  async findByStatus(status) {
    return this.findWithFilters({ estados: status });
  }

  /**
   * Find active reservas for a driver
   * @param {number} driverId - Driver's RUT
   * @returns {Promise<Array>} Driver's active reservas
   */
  async findActiveByDriver(driverId) {
    const results = await this.db(this.tableName)
      .select('*')
      .where('rut_conductor', driverId)
      .whereIn('estados', ['PENDIENTE', 'EN_CAMINO'])
      .whereNull('deletedatre');

    return results.map(result => new this.modelClass(result));
  }

  /**
   * Find reserva by ID with related data
   * @param {number} id - Reserva ID
   * @returns {Promise<ReservaModel|null>} Reserva with related data
   */
  async findByIdWithRelations(id) {
    const result = await this.db(this.tableName)
      .select(
        'reserva.*',
        'persona.nombre as conductor_nombre',
        'persona.apellido as conductor_apellido',
        'taxi.modelo as taxi_modelo',
        'taxi.ano as taxi_ano'
      )
      .leftJoin('persona', 'reserva.rut_conductor', 'persona.rut')
      .leftJoin('taxi', 'reserva.patente_taxi', 'taxi.patente')
      .where('reserva.codigoreserva', id)
      .whereNull('reserva.deletedatre')
      .first();

    return result ? new this.modelClass(result) : null;
  }

  async findWithDetails(codigoreserva) {
    try {
      const result = await this.db(this.tableName)
        .select(
          'reserva.*',
          'viaje.duracionv',
          'viaje.fechav',
          'viaje.origenv',
          'viaje.destinov',
          'boleta.total',
          'boleta.metodopago',
        )
        .leftJoin('viaje', 'reserva.codigo', 'viaje.codigo')
        .leftJoin('boleta', 'reserva.codigoboleta', 'boleta.codigoboleta')
        .where('reserva.codigoreserva', codigoreserva)
        .first();
        return result ? new this.modelClass(result) : null;
    } catch (error) {
      throw new Error(`Error buscando reserva con detalles: ${error.message}`);
    }
  }
} 