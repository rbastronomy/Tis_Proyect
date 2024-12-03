import { BaseService } from '../core/BaseService.js';
import { ReservaRepository } from '../repository/ReservaRepository.js';
import { HistorialRepository } from '../repository/HistorialRepository.js';
import { ViajeRepository } from '../repository/ViajeRepository.js';

export class TaxiBookingService extends BaseService {
  constructor() {
    const reservaRepository = new ReservaRepository();
    super(reservaRepository);
    this.historialRepository = new HistorialRepository();
    this.viajeRepository = new ViajeRepository();
  }

  /**
   * Creates a new booking with initial history record
   * @param {Object} bookingData - Booking data
   * @param {number} userId - User ID creating the booking
   * @returns {Promise<Object>} Created booking
   * @throws {Error} If creation fails
   */
  async createBooking(bookingData, userId) {
    try {
      // Create historial record first
      const historial = await this.historialRepository.create({
        rut: userId,
        accion: 'CREAR_RESERVA',
        descripcion: 'Nueva reserva creada',
        fecha: new Date()
      });

      // Create the booking with historial reference
      const booking = await this.repository.create({
        ...bookingData,
        idhistorial: historial.idhistorial,
        estados: 'EN_REVISION'
      });

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Error al crear la reserva');
    }
  }

  /**
   * Validates and assigns a driver to a booking
   * @param {number} bookingId - Booking ID
   * @param {string} action - APROBAR or RECHAZAR
   * @param {number} rutConductor - Driver's RUT
   * @param {string} patenteTaxi - Taxi's license plate
   * @param {string} motivo - Reason for decision
   * @returns {Promise<Object>} Updated booking
   * @throws {Error} If validation fails
   */
  async validateAndAssignDriver(bookingId, action, rutConductor, patenteTaxi, motivo) {
    try {
      const booking = await this.repository.findById(bookingId);
      if (!booking) {
        throw new Error('Reserva no encontrada');
      }

      if (booking.estados !== 'EN_REVISION') {
        throw new Error('La reserva no está en estado de revisión');
      }

      // Create historial record for the action
      const historial = await this.historialRepository.create({
        rut: rutConductor,
        accion: action === 'APROBAR' ? 'APROBAR_RESERVA' : 'RECHAZAR_RESERVA',
        descripcion: motivo || (action === 'APROBAR' ? 'Reserva aprobada' : 'Reserva rechazada'),
        fecha: new Date()
      });

      // Update booking based on action
      const updateData = {
        estados: action === 'APROBAR' ? 'PENDIENTE' : 'RECHAZADO',
        idhistorial: historial.idhistorial
      };

      if (action === 'APROBAR') {
        updateData.rut_conductor = rutConductor;
        updateData.patente_taxi = patenteTaxi;
      }

      const updatedBooking = await this.repository.update(bookingId, updateData);
      return updatedBooking;
    } catch (error) {
      console.error('Error validating booking:', error);
      throw new Error(`Error al validar la reserva: ${error.message}`);
    }
  }

  /**
   * Starts a trip for a booking
   * @param {number} bookingId - Booking ID
   * @param {number} driverId - Driver's RUT
   * @returns {Promise<Object>} Updated booking
   * @throws {Error} If start fails
   */
  async startTrip(bookingId, driverId) {
    try {
      const booking = await this.repository.findById(bookingId);
      if (!booking) {
        throw new Error('Reserva no encontrada');
      }

      if (booking.estados !== 'PENDIENTE') {
        throw new Error('La reserva no está en estado pendiente');
      }

      if (booking.rut_conductor !== driverId) {
        throw new Error('No autorizado para iniciar este viaje');
      }

      // Create historial record
      const historial = await this.historialRepository.create({
        rut: driverId,
        accion: 'INICIAR_VIAJE',
        descripcion: 'Viaje iniciado',
        fecha: new Date()
      });

      // Update booking status
      const updatedBooking = await this.repository.update(bookingId, {
        estados: 'EN_CAMINO',
        idhistorial: historial.idhistorial
      });

      return updatedBooking;
    } catch (error) {
      console.error('Error starting trip:', error);
      throw new Error(`Error al iniciar el viaje: ${error.message}`);
    }
  }

  /**
   * Completes a trip and creates viaje record
   * @param {number} bookingId - Booking ID
   * @param {number} driverId - Driver's RUT
   * @param {number} duracion - Trip duration
   * @param {string} observacion - Trip observations
   * @returns {Promise<Object>} Updated booking and created viaje
   * @throws {Error} If completion fails
   */
  async completeTrip(bookingId, driverId, duracion, observacion) {
    try {
      const booking = await this.repository.findById(bookingId);
      if (!booking) {
        throw new Error('Reserva no encontrada');
      }

      if (booking.estados !== 'EN_CAMINO') {
        throw new Error('El viaje no está en curso');
      }

      if (booking.rut_conductor !== driverId) {
        throw new Error('No autorizado para completar este viaje');
      }

      // Create historial record
      const historial = await this.historialRepository.create({
        rut: driverId,
        accion: 'COMPLETAR_VIAJE',
        descripcion: 'Viaje completado',
        fecha: new Date()
      });

      // Create viaje record
      const viaje = await this.viajeRepository.create({
        codigoreserva: bookingId,
        duracionv: duracion,
        observacionv: observacion,
        fechav: new Date()
      });

      // Update booking status
      const updatedBooking = await this.repository.update(bookingId, {
        estados: 'COMPLETADO',
        idhistorial: historial.idhistorial,
        frealizado: new Date()
      });

      return { booking: updatedBooking, viaje };
    } catch (error) {
      console.error('Error completing trip:', error);
      throw new Error(`Error al completar el viaje: ${error.message}`);
    }
  }

  /**
   * Cancels a booking
   * @param {number} bookingId - Booking ID
   * @param {number} userId - User ID requesting cancellation
   * @returns {Promise<Object>} Cancelled booking
   * @throws {Error} If cancellation fails
   */
  async cancelBooking(bookingId, userId) {
    try {
      const booking = await this.repository.findById(bookingId);
      if (!booking) {
        throw new Error('Reserva no encontrada');
      }

      if (!['EN_REVISION', 'PENDIENTE'].includes(booking.estados)) {
        throw new Error('La reserva no puede ser cancelada en su estado actual');
      }

      // Create historial record
      const historial = await this.historialRepository.create({
        rut: userId,
        accion: 'CANCELAR_RESERVA',
        descripcion: 'Reserva cancelada por el usuario',
        fecha: new Date()
      });

      // Update booking status
      const updatedBooking = await this.repository.update(bookingId, {
        estados: 'CANCELADO',
        idhistorial: historial.idhistorial,
        deletedatre: new Date()
      });

      return updatedBooking;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw new Error(`Error al cancelar la reserva: ${error.message}`);
    }
  }

  /**
   * Gets bookings with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered bookings
   * @throws {Error} If retrieval fails
   */
  async getBookings(filters = {}) {
    try {
      return await this.repository.findWithFilters(filters);
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw new Error('Error al obtener las reservas');
    }
  }

  /**
   * Gets all pending bookings
   * @returns {Promise<Array>} Pending bookings
   * @throws {Error} If retrieval fails
   */
  async findReservasPendientes() {
    try {
      return await this.repository.findByStatus('PENDIENTE');
    } catch (error) {
      console.error('Error getting pending bookings:', error);
      throw new Error('Error al obtener las reservas pendientes');
    }
  }
} 