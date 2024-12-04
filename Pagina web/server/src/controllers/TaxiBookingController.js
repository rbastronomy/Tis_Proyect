import { TaxiBookingService } from '../services/TaxiBookingService.js';

export class TaxiBookingController {
  constructor() {
    this.taxiBookingService = new TaxiBookingService();
  }

  /**
   * Creates a new taxi booking
   * @param {Object} request - Fastify request object
   * @param {Object} request.body - Booking data
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object containing new booking data
   */
  async createBooking(request, reply) {
    try {
      const userId = request.user.rut; // From auth middleware
      const bookingData = {
        origenv: request.body.origenv,
        destinov: request.body.destinov,
        freserva: request.body.freserva,
        tipo: request.body.tipo || 'NORMAL',
        observacion: request.body.observacion || '',
        codigos: request.body.codigos, // For solicita table
        tarifa_id: request.body.tarifa_id // For reserva_tarifa table
      };

      const booking = await this.taxiBookingService.createBooking(bookingData, userId);
      
      return reply.code(201).send({
        message: 'Reserva creada exitosamente',
        booking
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        error: 'Error al crear la reserva',
        details: error.message 
      });
    }
  }

  /**
   * Gets all bookings with optional filters
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object containing bookings list
   */
  async getBookings(request, reply) {
    try {
      const filters = {
        estados: request.query.status,
        fecha: request.query.date,
        userId: request.query.userId
      };

      const bookings = await this.taxiBookingService.getBookings(filters);
      
      return reply.send({
        message: 'Reservas recuperadas exitosamente',
        reservas: bookings
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        error: 'Error al recuperar las reservas',
        details: error.message 
      });
    }
  }

  /**
   * Gets a specific booking by ID
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object containing booking data
   */
  async getBookingById(request, reply) {
    try {
      const bookingId = request.params.bookingId;
      const booking = await this.taxiBookingService.getBookingById(bookingId);
      
      if (!booking) {
        return reply.code(404).send({ 
          error: 'Reserva no encontrada' 
        });
      }

      return reply.send({
        message: 'Reserva recuperada exitosamente',
        booking: booking.toJSON()
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        error: 'Error al recuperar la reserva',
        details: error.message 
      });
    }
  }

  /**
   * Updates booking status
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object containing updated booking
   */
  async updateBookingStatus(request, reply) {
    try {
      const bookingId = request.params.bookingId;
      const { status } = request.body;
      
      const booking = await this.taxiBookingService.updateBookingStatus(
        bookingId, 
        status,
        request.user.rut // For tracking who updated the status
      );

      return reply.send({
        message: 'Estado de reserva actualizado exitosamente',
        booking: booking.toJSON()
      });
    } catch (error) {
      request.log.error(error);
      if (error.message.includes('Estado de reserva inválido')) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ 
        error: 'Error al actualizar el estado de la reserva',
        details: error.message 
      });
    }
  }

  /**
   * Cancels a booking
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object confirming cancellation
   */
  async cancelBooking(request, reply) {
    try {
      const bookingId = request.params.bookingId;
      const userId = request.user.rut;
      
      await this.taxiBookingService.cancelBooking(bookingId, userId);

      return reply.send({
        message: 'Reserva cancelada exitosamente'
      });
    } catch (error) {
      request.log.error(error);
      if (error.message.includes('No autorizado')) {
        return reply.code(403).send({ error: error.message });
      }
      if (error.message.includes('no encontrada')) {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ 
        error: 'Error al cancelar la reserva',
        details: error.message 
      });
    }
  }

  /**
   * Validates booking and assigns driver
   * @param {Object} request - Fastify request object
   * @param {Object} request.params - Request parameters
   * @param {Object} request.body - Request body
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object with updated booking
   */
  async validateAndAssignDriver(request, reply) {
    try {
      const { bookingId } = request.params;
      const { estadoReserva, rutConductor, patenteTaxi, motivo } = request.body;
      
      const booking = await this.taxiBookingService.validateAndAssignDriver(
        bookingId,
        estadoReserva,
        rutConductor,
        patenteTaxi,
        motivo
      );

      return reply.send({
        message: `Reserva ${estadoReserva === 'APROBAR' ? 'aprobada' : 'rechazada'} exitosamente`,
        booking: booking.toJSON()
      });
    } catch (error) {
      request.log.error(error);
      if (error.message.includes('no encontrada')) {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({
        error: 'Error al procesar la reserva',
        details: error.message
      });
    }
  }

  /**
   * Starts a trip
   * @param {Object} request - Fastify request object
   * @param {Object} request.params - Request parameters
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object confirming trip start
   */
  async startTrip(request, reply) {
    try {
      const { bookingId } = request.params;
      const driverId = request.user.rut;

      const booking = await this.taxiBookingService.startTrip(bookingId, driverId);

      return reply.send({
        message: 'Viaje iniciado exitosamente',
        booking: booking.toJSON()
      });
    } catch (error) {
      request.log.error(error);
      if (error.message.includes('no encontrada')) {
        return reply.code(404).send({ error: error.message });
      }
      if (error.message.includes('No autorizado')) {
        return reply.code(403).send({ error: error.message });
      }
      return reply.code(500).send({
        error: 'Error al iniciar el viaje',
        details: error.message
      });
    }
  }

  /**
   * Completes a trip
   * @param {Object} request - Fastify request object
   * @param {Object} request.params - Request parameters
   * @param {Object} request.body - Request body
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object confirming trip completion
   */
  async completeTrip(request, reply) {
    try {
      const { bookingId } = request.params;
      const { duracion, observacion } = request.body;
      const driverId = request.user.rut;

      const result = await this.taxiBookingService.completeTrip(
        bookingId,
        driverId,
        duracion,
        observacion
      );

      return reply.send({
        message: 'Viaje completado exitosamente',
        trip: result.toJSON()
      });
    } catch (error) {
      request.log.error(error);
      if (error.message.includes('no encontrada')) {
        return reply.code(404).send({ error: error.message });
      }
      if (error.message.includes('No autorizado')) {
        return reply.code(403).send({ error: error.message });
      }
      return reply.code(500).send({
        error: 'Error al completar el viaje',
        details: error.message
      });
    }
  }

  /**
   * Gets pending bookings
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object with pending bookings
   */
  async getReservasPendientes(request, reply) {
    try {
      const bookings = await this.taxiBookingService.getPendingBookings();

      return reply.send({
        message: 'Reservas pendientes recuperadas exitosamente',
        bookings: bookings.map(booking => booking.toJSON())
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        error: 'Error al recuperar las reservas pendientes',
        details: error.message
      });
    }
  }
} 