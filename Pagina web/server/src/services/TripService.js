import { BaseService } from "../core/BaseService.js";
import { TripRepository } from "../repository/TripRepository.js";
import { TripModel } from "../models/TripModel.js";
import { BookingService } from "./BookingService.js";
import { UserService } from "./UserService.js";
import { TaxiService } from "./TaxiService.js";
import { ReceiptService } from './ReceiptService.js';
import { GeneraRepository } from '../repository/GeneraRepository.js';
import { ReceiptModel } from '../models/ReceiptModel.js';

export class TripService extends BaseService {
    constructor() {
        const tripRepository = new TripRepository();
        super(tripRepository);
        this.bookingService = new BookingService();
        this.userService = new UserService();
        this.taxiService = new TaxiService();
        this.receiptService = new ReceiptService();
        this.generaRepository = new GeneraRepository();
    }

    /**
     * Creates a trip record from a completed booking with receipt
     * @param {number} bookingId - Booking ID
     * @param {Object} tripData - Trip completion data
     * @param {number} tripData.duracion - Trip duration in minutes
     * @param {number} tripData.pasajeros - Number of passengers
     * @param {string} tripData.observacion_viaje - Trip observations
     * @param {string} tripData.metodo_pago - Payment method (EFECTIVO/TRANSFERENCIA)
     * @returns {Promise<TripModel>} Created trip
     */
    async createFromBooking(bookingId, tripData) {
        try {
            console.log('TripService - Creating trip from booking:', {
                bookingId,
                tripData
            });

            // Get booking with full details
            const booking = await this.bookingService.getBookingByCode(bookingId);

            if (!booking) {
                throw new Error('Reserva no encontrada');
            }
            if (booking.estado_reserva !== 'RECOGIDO') {
                throw new Error('La reserva debe estar en estado RECOGIDO');
            }

            // Get the rate from the service
            const rate = booking._data.servicio?.tarifas?.[0];

            if (!rate || typeof rate.precio !== 'number' || rate.precio <= 0) {
                console.error('TripService - Invalid rate:', {
                    servicio: booking._data.servicio,
                    tarifas: booking._data.servicio?.tarifas,
                    rate
                });
                throw new Error('La reserva no tiene una tarifa asociada');
            }

            // Validate required fields
            if (!tripData.duracion) {
                console.error('TripService - Missing duration:', tripData);
                throw new Error('La duración del viaje es requerida');
            }

            return await this.repository.transaction(async (trx) => {
                // Create trip record
                const newTrip = await this.repository.create({
                    origen_viaje: booking.origen_reserva,
                    destino_viaje: booking.destino_reserva,
                    duracion: tripData.duracion,
                    pasajeros: tripData.pasajeros,
                    observacion_viaje: tripData.observacion_viaje || '',
                    fecha_viaje: new Date(),
                    estado_viaje: 'COMPLETADO'
                }, trx);

                // Create receipt with service rate
                const receipt = await this.receiptService.create({
                    total: rate.precio,
                    fecha_emision: new Date(),
                    metodo_pago: tripData.metodo_pago,
                    descripcion_boleta: `Viaje desde ${booking.origen_reserva} hasta ${booking.destino_reserva}`,
                    estado_boleta: 'PAGADO'
                }, trx);

                // Create junction record to link trip, booking and receipt
                await this.generaRepository.create({
                    codigo_viaje: newTrip.codigo_viaje,
                    codigo_reserva: bookingId,
                    codigo_boleta: receipt.codigo_boleta,
                    fecha_generada: new Date()
                }, trx);

                // Return TripModel with all required data
                return new TripModel({
                    ...newTrip,
                    booking,
                    receipt
                });
            });
        } catch (error) {
            console.error('TripService - Error:', error);
            throw new Error(`Error al crear viaje: ${error.message}`);
        }
    }

    /**
     * Gets trips by driver
     * @param {number} driverId - Driver's RUT
     * @returns {Promise<Array<TripModel>>} Driver's trips
     */
    async getDriverTrips(driverId) {
        try {
            const trips = await this.repository.findByDriver(driverId);
            return trips.map(trip => new TripModel(trip));
        } catch (error) {
            throw new Error(`Error al obtener viajes del conductor: ${error.message}`);
        }
    }

    /**
     * Gets trips by client
     * @param {number} clientId - Client's RUT
     * @returns {Promise<Array<TripModel>>} Client's trips
     */
    async getClientTrips(clientId) {
        try {
            const trips = await this.repository.findByUser(clientId);
            return trips.map(trip => new TripModel(trip));
        } catch (error) {
            throw new Error(`Error al obtener viajes del cliente: ${error.message}`);
        }
    }

    /**
     * Gets trip with full details
     * @param {number} codigoReserva - Booking ID
     * @returns {Promise<TripModel>} Trip with details
     */
    async getTripWithDetails(codigoReserva) {
        try {
            // Get trip data with references
            const tripWithRef = await this.repository.findWithBookingRef(codigoReserva);
            if (!tripWithRef) {
                throw new Error('Viaje no encontrado');
            }

            // Get full booking details
            const booking = await this.bookingService.getBookingByCode(codigoReserva);
            if (!booking) {
                throw new Error('Reserva no encontrada');
            }

            // Create receipt model if we have receipt data
            let receipt = null;
            if (tripWithRef.codigo_boleta) {
                receipt = new ReceiptModel({
                    codigo_boleta: tripWithRef.codigo_boleta,
                    total: tripWithRef.total,
                    metodo_pago: tripWithRef.metodo_pago,
                    fecha_emision: tripWithRef.fecha_emision,
                    descripcion_boleta: tripWithRef.descripcion_boleta
                });
            }

            // Create trip model with booking and receipt
            return new TripModel({
                codigo_viaje: tripWithRef.codigo_viaje,
                origen_viaje: tripWithRef.origen_viaje,
                destino_viaje: tripWithRef.destino_viaje,
                duracion: tripWithRef.duracion,
                pasajeros: tripWithRef.pasajeros,
                observacion_viaje: tripWithRef.observacion_viaje,
                fecha_viaje: tripWithRef.fecha_viaje,
                estado_viaje: tripWithRef.estado_viaje,
                booking,  // Include the full booking model
                receipt,  // Include receipt if available
                created_at: tripWithRef.created_at,
                updated_at: tripWithRef.updated_at,
                deleted_at_viaje: tripWithRef.deleted_at_viaje
            });
        } catch (error) {
            console.error('Error getting trip details:', error);
            throw new Error(`Error al obtener detalles del viaje: ${error.message}`);
        }
    }

    /**
     * Gets trips by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<Array<TripModel>>} Trips in range
     */
    async getTripsByDateRange(startDate, endDate) {
        try {
            if (startDate > endDate) {
                throw new Error('Fecha inicial debe ser anterior a fecha final');
            }
            const trips = await this.repository.findByDateRange(startDate, endDate);
            return trips.map(trip => new TripModel(trip));
        } catch (error) {
            throw new Error(`Error al obtener viajes por rango de fecha: ${error.message}`);
        }
    }

    /**
     * Gets trips for a booking
     * @param {number} bookingId - Booking ID
     * @returns {Promise<Array<TripModel>>} Booking's trips
     */
    async getTripsByBooking(bookingId) {
        try {
            const trips = await this.repository.findByBooking(bookingId);
            return trips.map(trip => new TripModel(trip));
        } catch (error) {
            throw new Error(`Error al obtener viajes de la reserva: ${error.message}`);
        }
    }

    /**
     * Soft deletes a trip record
     * @param {number} tripId - Trip ID
     * @returns {Promise<TripModel>} Deleted trip
     */
    async softDelete(tripId) {
        try {
            const deletedTrip = await this.repository.softDelete(tripId);
            if (!deletedTrip) {
                throw new Error('Viaje no encontrado');
            }
            return new TripModel(deletedTrip);
        } catch (error) {
            throw new Error(`Error al eliminar viaje: ${error.message}`);
        }
    }
}

export default TripService;