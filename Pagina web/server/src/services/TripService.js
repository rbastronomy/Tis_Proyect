import { BaseService } from "../core/BaseService.js";
import { TripRepository } from "../repository/TripRepository.js";
import { TripModel } from "../models/TripModel.js";
import { BookingService } from "./BookingService.js";
import { UserService } from "./UserService.js";
import { TaxiService } from "./TaxiService.js";
import { ReceiptService } from './ReceiptService.js';
import { GeneraRepository } from '../repository/GeneraRepository.js';

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
            // Validate booking exists and is in correct state
            const booking = await this.bookingService.getBookingByCode(bookingId);
            if (!booking) {
                throw new Error('Reserva no encontrada');
            }
            if (booking.estado_reserva !== 'RECOGIDO') {
                throw new Error('La reserva debe estar en estado RECOGIDO');
            }

            return await this.repository.transaction(async (trx) => {
                // 1. Create trip record
                const newTrip = await this.repository.create({
                    codigo_reserva: bookingId,
                    origen_viaje: booking.origen_reserva,
                    destino_viaje: booking.destino_reserva,
                    duracion: tripData.duracion,
                    pasajeros: tripData.pasajeros,
                    observacion_viaje: tripData.observacion_viaje || '',
                    fecha_viaje: new Date(),
                    estado_viaje: 'COMPLETADO'
                }, trx);

                // 2. Create receipt with payment method from frontend
                const receipt = await this.receiptService.create({
                    total: booking.tarifa.precio,
                    fecha_emision: new Date(),
                    metodo_pago: tripData.metodo_pago,
                    descripcion_boleta: `Viaje desde ${booking.origen_reserva} hasta ${booking.destino_reserva}`,
                    estado_boleta: 'PAGADO'
                }, trx);

                // 3. Create junction record
                await this.generaRepository.create({
                    codigo_viaje: newTrip.codigo_viaje,
                    codigo_reserva: bookingId,
                    codigo_boleta: receipt.codigo_boleta
                }, trx);

                // Return trip with related data
                return new TripModel({
                    ...newTrip,
                    booking,
                    receipt
                });
            });
        } catch (error) {
            // Add more context to the error
            if (error.message.includes('metodo_pago')) {
                throw new Error('Método de pago inválido');
            }
            if (error.message.includes('duracion')) {
                throw new Error('La duración del viaje es requerida');
            }
            if (error.message.includes('pasajeros')) {
                throw new Error('El número de pasajeros es requerido');
            }
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
     * @param {number} tripId - Trip ID
     * @returns {Promise<TripModel>} Trip with details
     */
    async getTripWithDetails(tripId) {
        try {
            const tripWithRef = await this.repository.findWithBookingRef(tripId);
            if (!tripWithRef) {
                throw new Error('Viaje no encontrado');
            }

            const booking = await this.bookingService.getBookingByCode(tripWithRef.codigo_reserva);

            return new TripModel({
                ...tripWithRef,
                booking
            });
        } catch (error) {
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