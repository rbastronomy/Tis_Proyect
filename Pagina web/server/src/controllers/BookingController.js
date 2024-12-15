import { BaseController } from "../core/BaseController.js";
import { BookingService } from "../services/BookingService.js";

/** @typedef {import('../core/BaseRouter.js').AuthenticatedRequest} AuthenticatedRequest */

class BookingController extends BaseController {
    constructor() {
        const bookingService = new BookingService();
        super(bookingService);
    }

    /**
     * Creates a new booking
     * @param {AuthenticatedRequest} request - Fastify request object with authenticated user
     * @param {import('fastify').FastifyReply} reply - Fastify reply object
     * @returns {Promise<Object>} Response object containing new booking data
     */
    async createBooking(request, reply) {
        try {
            const bookingData = {
                rut_cliente: request.user.rut,
                origen_reserva: request.body.origen_reserva,
                destino_reserva: request.body.destino_reserva,
                fecha_reserva: request.body.fecha_reserva,
                tipo_reserva: request.body.tipo_reserva,
                observacion_reserva: request.body.observacion_reserva || '',
                codigo_servicio: request.body.codigo_servicio,
                id_tarifa: request.body.id_tarifa
            };

            console.log('Creating booking with data:', bookingData);
            
            const booking = await this.service.createBooking(bookingData);
            
            return reply.code(201).send({
                message: 'Reserva creada exitosamente',
                booking: booking.toJSON()
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

            const bookings = await this.service.getBookings(filters);
            console.log(bookings);
            
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
     * Gets a specific booking by code
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<Object>} Response object containing booking data
     */
    async getBookingByCode(request, reply) {
        try {
            const codigoReserva = request.params.codigoreserva;
            console.log('BookingController - Getting booking:', codigoReserva);
            
            const booking = await this.service.getBookingByCode(codigoReserva);
            if (!booking) {
                return reply.code(404).send({ 
                    error: 'Reserva no encontrada' 
                });
            }

            const bookingData = booking.toJSON();
            console.log('BookingController - Sending booking data:', bookingData);

            return reply.send({
                message: 'Reserva recuperada exitosamente',
                reserva: bookingData
            });
        } catch (error) {
            console.error('BookingController - Error:', error);
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
            
            const booking = await this.service.updateBookingStatus(
                bookingId, 
                status,
                request.user.rut
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
            
            await this.service.cancelBooking(bookingId, userId);

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
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<void>}
     */
    async validateAndAssignDriver(request, reply) {
        try {
            const bookingId = request.params.codigoreserva;
            const { estados, rut_conductor, patente_taxi, observacion } = request.body;

            console.log('Validating booking request:', {
                bookingId,
                estados,
                rut_conductor,
                patente_taxi,
                observacion
            });

            const bookingModel = await this.service.validateAndAssignDriver(
                bookingId,
                estados,
                rut_conductor,
                patente_taxi,
                observacion
            );

            return reply.send({
                message: `Reserva ${estados === 'APROBAR' ? 'aprobada' : 'actualizada'} exitosamente`,
                booking: bookingModel.toJSON()
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

            const booking = await this.service.startTrip(bookingId, driverId);

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

            const result = await this.service.completeTrip(
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
            const bookings = await this.service.getPendingBookings();

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

    /**
     * Gets estimated cost for a booking
     * @param {Object} request - Fastify request object
     * @param {Object} request.query - Query parameters containing servicioId and tarifaId
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<Object>} Response object with estimated cost
     */
    async getCostoEstimado(request, reply) {
        try {
            const { servicioId, tarifaId } = request.query;
            
            const costoEstimado = await this.service.getCostoEstimado(
                servicioId, 
                tarifaId
            );
            
            return reply.code(200).send({ 
                costo_estimado: costoEstimado 
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: error.message
            });
        }
    }

    /**
     * Gets a specific booking by code with limited data for clients
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<Object>} Response object containing booking data
     */
    async getClientBookingByCode(request, reply) {
        try {
            const codigoReserva = request.params.codigoreserva;
            const clientRut = request.user.rut;
            
            console.log('BookingController - Getting client booking:', codigoReserva);
            
            const booking = await this.service.getClientBookingByCode(codigoReserva, clientRut);
            
            if (!booking) {
                return reply.code(404).send({ 
                    error: 'Reserva no encontrada' 
                });
            }

            return reply.send({
                message: 'Reserva recuperada exitosamente',
                reserva: booking.toJSON()
            });
        } catch (error) {
            console.error('BookingController - Error:', error);
            
            if (error.message.includes('No autorizado')) {
                return reply.code(403).send({ 
                    error: error.message 
                });
            }
            
            return reply.code(500).send({ 
                error: 'Error al recuperar la reserva',
                details: error.message 
            });
        }
    }

    /**
     * Gets bookings for the authenticated client
     * @param {AuthenticatedRequest} request - Fastify request object with authenticated user
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<Object>} Response object containing client's bookings
     */
    async getClientBookings(request, reply) {
        try {
            const clientRut = request.user.rut;
            console.log('Getting bookings for client:', clientRut);

            const bookings = await this.service.getClientBookings(clientRut);
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
     * Handles errors in a standardized way
     * @private
     * @param {import('fastify').FastifyReply} reply - Fastify reply object
     * @param {Error} error - Error to handle
     */
    handleError(reply, error) {
        console.error('Controller Error:', error);
        
        if (error.message.includes('no encontrada') || error.message.includes('not found')) {
            return reply.code(404).send({ 
                error: 'Not Found',
                message: error.message 
            });
        }
        
        if (error.message.includes('No autorizado') || error.message.includes('unauthorized')) {
            return reply.code(403).send({ 
                error: 'Forbidden',
                message: error.message 
            });
        }
        
        return reply.code(500).send({ 
            error: 'Internal Server Error',
            message: error.message 
        });
    }

    /**
     * Retrieves bookings for a specific driver.
     * @param {Object} request - The HTTP request object
     * @param {Object} reply - The HTTP reply object
     * @returns {Promise<void>}
     */
    async getDriverBookings(request, reply) {
        try {
            const driverId = request.params.driverId;
            
            // Validate that the requesting driver can only see their own bookings
            if (request.user.rut !== Number(driverId)) {
                throw new Error('No autorizado para ver estas reservas');
            }

            const bookings = await this.service.getDriverBookings(driverId);
            
            reply.send({
                message: 'Reservas recuperadas exitosamente',
                reservas: bookings
            });
        } catch (error) {
            this.handleError(reply, error);
        }
    }
}

export default BookingController;
