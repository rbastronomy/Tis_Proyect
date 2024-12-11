import { BaseRepository } from "../core/BaseRepository.js";

export class BookingRepository extends BaseRepository {
  constructor() {
    super("reserva", null, "codigo_reserva");
  }

  /**
   * Create new booking
   * @param {Object} bookingData - Booking data
   * @param {Object} [trx] - Optional transaction object
   * @returns {Promise<Object>} Created booking raw data
   */
  async create(bookingData, trx = null) {
    try {
      const { codigo_reserva, history, ...dataToInsert } = bookingData;
      dataToInsert.created_at = new Date();
      dataToInsert.updated_at = new Date();
      
      const query = (trx || this.db)(this.tableName)
        .insert(dataToInsert)
        .returning("*");

      const [created] = await query;
      return created;
    } catch (error) {
      throw new Error(`Error creating booking: ${error.message}`);
    }
  }

  /**
   * Update booking
   * @param {number} codigo_reserva - Booking ID
   * @param {Object} updateData - Updated booking data
   * @param {Object} [trx] - Optional transaction object
   * @returns {Promise<Object|null>} Updated booking raw data or null
   */
  async update(codigo_reserva, updateData, trx = null) {
    try {
      const query = (trx || this.db)(this.tableName)
        .where("codigo_reserva", codigo_reserva)
        .update(updateData)
        .returning("*");

      const [updated] = await query;
      return updated || null;
    } catch (error) {
      throw new Error(`Error updating booking: ${error.message}`);
    }
  }

  /**
   * Soft delete booking
   * @param {number} codigo_reserva - Booking ID
   * @returns {Promise<Object|null>} Deleted booking raw data or null
   */
  async softDelete(codigo_reserva) {
    try {
      const [deleted] = await this.db(this.tableName)
        .where("codigo_reserva", codigo_reserva)
        .update({
          estado_reserva: "ELIMINADO",
          deleted_at_reserva: new Date(),
        })
        .returning("*");
      return deleted || null;
    } catch (error) {
      throw new Error(`Error soft deleting booking: ${error.message}`);
    }
  }

  /**
   * Find booking by ID
   * @param {number} codigo_reserva - Booking ID
   * @returns {Promise<Object|null>} Raw booking data or null
   */
  async findById(codigo_reserva) {
    try {
      return await this.db(this.tableName)
        .where("codigo_reserva", codigo_reserva)
        .first();
    } catch (error) {
      throw new Error(`Error finding booking by ID: ${error.message}`);
    }
  }

  /**
   * Find booking by trip
   * @param {number} codigo_viaje - Trip ID
   * @returns {Promise<Object|null>} Raw booking data or null
   */
  async findByTrip(codigo_viaje) {
    try {
      return await this.db(this.tableName)
        .where("codigo_viaje", codigo_viaje)
        .first();
    } catch (error) {
      throw new Error(`Error finding booking by trip: ${error.message}`);
    }
  }

  /**
   * Find bookings with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Raw booking data array
   */
  async findWithFilters(filters) {
    try {
      const query = this.db(this.tableName)
        .distinct("reserva.*", "servicio.tipo_servicio", "servicio.descripcion_servicio")
        .leftJoin("oferta", "reserva.id_oferta", "oferta.id_oferta")
        .leftJoin("servicio", "oferta.codigo_servicio", "servicio.codigo_servicio")
        .whereNull("reserva.deleted_at_reserva");

      if (filters.estado_reserva) {
        query.where("reserva.estado_reserva", filters.estado_reserva);
      }

      if (filters.fecha_reserva) {
        query.where("reserva.fecha_reserva", filters.fecha_reserva);
      }

      if (filters.rut_cliente) {
        query.where("reserva.rut_cliente", filters.rut_cliente);
      }

      const bookings = await query;

      // Get rates for each booking
      return await Promise.all(
        bookings.map(async (booking) => {
          const rateQuery = await this.db("tarifa")
            .select("tarifa.precio", "tarifa.descripcion_tarifa", "tarifa.tipo_tarifa")
            .join("oferta", "tarifa.id_tarifa", "oferta.id_tarifa")
            .where("oferta.id_oferta", booking.id_oferta)
            .first();

          return {
            ...booking,
            servicio: booking.tipo_servicio ? {
              tipo: booking.tipo_servicio,
              descripcion: booking.descripcion_servicio
            } : null,
            tarifa: rateQuery ? {
              precio: rateQuery.precio,
              descripcion: rateQuery.descripcion_tarifa,
              tipo: rateQuery.tipo_tarifa
            } : null
          };
        })
      );
    } catch (error) {
      throw new Error(`Error finding bookings with filters: ${error.message}`);
    }
  }

  /**
   * Find bookings by status
   * @param {string} status - Status to filter by
   * @returns {Promise<Array>} Raw booking data array
   */
  async findByStatus(status) {
    return this.findWithFilters({ estado_reserva: status });
  }

  /**
   * Find pending bookings
   * @returns {Promise<Array>} Raw booking data array
   */
  async findPendingBookings() {
    return this.findByStatus("PENDIENTE");
  }

  /**
   * Find active bookings for a driver
   * @param {number} rut_conductor - Driver's RUT
   * @returns {Promise<Array>} Raw booking data array
   */
  async findActiveByDriver(rut_conductor) {
    return await this.db(this.tableName)
      .select("*")
      .where("rut_conductor", rut_conductor)
      .whereIn("estado_reserva", ["PENDIENTE", "EN_CAMINO"])
      .whereNull("deleted_at_reserva");
  }

  /**
   * Find booking by ID with related data
   * @param {number} codigo_reserva - Booking ID
   * @returns {Promise<Object|null>} Raw booking data with relations or null
   */
  async findWithDetails(codigo_reserva) {
    try {
      return await this.db(this.tableName)
        .select(
          "reserva.*",
          "viaje.duracion",
          "viaje.fecha_viaje",
          "viaje.origen_viaje",
          "viaje.destino_viaje",
          "boleta.total",
          "boleta.metodo_pago",
          "persona.nombre as conductor_nombre",
          "persona.apellido as conductor_apellido",
          "taxi.modelo as taxi_modelo",
          "taxi.ano as taxi_ano"
        )
        .leftJoin("viaje", "reserva.codigo_viaje", "viaje.codigo_viaje")
        .leftJoin("boleta", "reserva.codigo_boleta", "boleta.codigo_boleta")
        .leftJoin("persona", "reserva.rut_conductor", "persona.rut")
        .leftJoin("taxi", "reserva.patente_taxi", "taxi.patente")
        .where("reserva.codigo_reserva", codigo_reserva)
        .first();
    } catch (error) {
      throw new Error(`Error finding booking with details: ${error.message}`);
    }
  }

  /**
   * Find all bookings
   * @returns {Promise<Array>} Raw booking data array
   */
  async findAll() {
    try {
      return await this.db(this.tableName)
        .select("*")
        .whereNull("deleted_at_reserva");
    } catch (error) {
      throw new Error(`Error getting all bookings: ${error.message}`);
    }
  }

  /**
   * Find booking by its code
   * @param {number} codigo_reserva - Booking code
   * @returns {Promise<Object|null>} Raw booking data or null
   */
  async findByCodigoReserva(codigo_reserva) {
    try {
      const booking = await this.db(this.tableName)
        .select(
          'codigo_reserva',
          'rut_cliente',
          'id_oferta',
          'origen_reserva',
          'destino_reserva',
          'fecha_reserva',
          'fecha_realizado',
          'tipo_reserva',
          'observacion_reserva',
          'estado_reserva'
        )
        .where('codigo_reserva', codigo_reserva)
        .whereNull('deleted_at_reserva')
        .first();

      return booking || null;
    } catch (error) {
      throw new Error(`Error finding booking by code: ${error.message}`);
    }
  }
}

export default BookingRepository;
