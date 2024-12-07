import { BaseService } from "../core/BaseService.js";
import BookingRepository from "../repository/BookingRepository.js";
import { TaxiService } from "./TaxiService.js";
import { HistoryRepository } from '../repository/HistoryRepository.js';
import { GeneraRepository } from '../repository/GeneraRepository.js';
import { ServiceService } from './ServiceService.js';
import { RateService } from './RateService.js';
import { TripRepository } from '../repository/TripRepository.js';

export class BookingService extends BaseService {
    constructor() {
        const bookingRepository = new BookingRepository();
        super(bookingRepository);
        this.taxiService = new TaxiService();
        this.HistoryRepository = new HistoryRepository();
        this.generaRepository = new GeneraRepository();
        this.serviceService = new ServiceService();
        this.rateService = new RateService();
        this.tripRepository = new TripRepository();
    }

    /**
     * Creates a new booking
     * @param {Object} bookingData - Booking data
     * @returns {Promise<Object>} Created booking
     * @throws {Error} If creation fails
     */
    async createBooking(bookingData) {
        this.validarDatosBooking(bookingData);

        const trx = await this.repository.transaction();

        try {
            const historial = await this.crearEntradaHistorial(trx, 'creada');
            bookingData.historial = historial.codigoreserva;
            bookingData.estados = 'pendiente';
            
            const createdBooking = await this.repository.create(bookingData);
            await trx.commit();
            return createdBooking;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    /**
     * Creates a new taxi booking with initial history record
     * @param {Object} bookingData - Booking data
     * @param {number} userId - User ID creating the booking
     * @returns {Promise<Object>} Created booking
     * @throws {Error} If creation fails
     */
    async createTaxiBooking(bookingData, userId) {
        try {
            const serviceTariffs = await this.serviceService.getTariffsByType(bookingData.codigos, bookingData.rideType);
            const isValidTariff = serviceTariffs.some(tariff => tariff.id === bookingData.tarifa_id);
            
            if (!isValidTariff) {
                throw new Error('La tarifa seleccionada no es válida para este servicio');
            }

            const historial = await this.HistoryRepository.create({
                estadoh: 'RESERVA_CREADA',
                fcambio: new Date()
            });

            const { codigos, tarifa_id, rideType, ...reservaData } = bookingData;

            const booking = await this.repository.create({
                ...reservaData,
                idhistorial: historial.idhistorial,
                estados: 'EN_REVISION'
            });

            await this.solicitaRepository.create({
                rut: userId,
                codigoreserva: booking.codigoreserva,
                codigos: codigos,
                fechasolicitud: new Date()
            });

            const [service, tariff] = await Promise.all([
                this.serviceService.findByCodigos(codigos),
                this.rateService.findById(tarifa_id)
            ]);

            return {
                ...booking,
                servicio: service,
                tarifa: tariff
            };
        } catch (error) {
            console.error('Error creating booking:', error);
            throw new Error(`Error al crear la reserva: ${error.message}`);
        }
    }

    /**
     * Assigns a taxi to a booking
     * @param {string} codigoreserva - Booking code
     * @param {string} taxiRut - Taxi RUT
     * @returns {Promise<Object>} Updated booking
     * @throws {Error} If assignment fails
     */
    async assignTaxiToBooking(codigoreserva, taxiRut) {
        const taxi = await this.taxiService.findByRut(taxiRut);
        if (!taxi || taxi.estado !== 'disponible') {
            throw new Error('Taxi no disponible');
        }
    
        const reservaActualizada = await this.repository.updateReservaEstado(
            codigoreserva, 
            'asignada'
        );
    
        await this.taxiService.updateEstado(taxiRut, 'ocupado');
    
        return reservaActualizada;
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

            const historial = await this.HistoryRepository.create({
                rut: rutConductor,
                accion: action === 'APROBAR' ? 'APROBAR_RESERVA' : 'RECHAZAR_RESERVA',
                descripcion: motivo || (action === 'APROBAR' ? 'Reserva aprobada' : 'Reserva rechazada'),
                fecha: new Date()
            });

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
     * Cancels a booking
     * @param {string} codigoreserva - Booking code
     * @returns {Promise<Object>} Cancelled booking
     * @throws {Error} If cancellation fails
     */
    async cancelBooking(codigoreserva) {
        const booking = await this.repository.findByCodigoReserva(codigoreserva);
        
        if (!booking) {
            throw new Error('Reserva no encontrada');
        }

        const bookingCanceled = await this.repository.updateReservaEstado(
            codigoreserva, 
            'cancelada'
        );

        if (booking.taxi_rut){
            await this.taxiService.updateEstado(booking.taxi_rut, 'disponible');
        }
    
        const reserva = await this.repository.findByCodigoReserva(codigoreserva);
        await this.taxiService.updateEstado(reserva.taxiRut, 'disponible');
    
        return bookingCanceled;
    }

    /**
     * Cancels a taxi booking
     * @param {number} bookingId - Booking ID
     * @param {number} userId - User ID requesting cancellation
     * @returns {Promise<Object>} Cancelled booking
     * @throws {Error} If cancellation fails
     */
    async cancelTaxiBooking(bookingId, userId) {
        try {
            const booking = await this.repository.findById(bookingId);
            if (!booking) {
                throw new Error('Reserva no encontrada');
            }

            if (!['EN_REVISION', 'PENDIENTE'].includes(booking.estados)) {
                throw new Error('La reserva no puede ser cancelada en su estado actual');
            }

            const historial = await this.HistoryRepository.create({
                rut: userId,
                accion: 'CANCELAR_RESERVA',
                descripcion: 'Reserva cancelada por el usuario',
                fecha: new Date()
            });

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

            const historial = await this.HistoryRepository.create({
                rut: driverId,
                accion: 'INICIAR_VIAJE',
                descripcion: 'Viaje iniciado',
                fecha: new Date()
            });

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

            const historial = await this.HistoryRepository.create({
                rut: driverId,
                accion: 'COMPLETAR_VIAJE',
                descripcion: 'Viaje completado',
                fecha: new Date()
            });

            const viaje = await this.tripRepository.create({
                codigoreserva: bookingId,
                duracionv: duracion,
                observacionv: observacion,
                fechav: new Date()
            });

            await this.generaRepository.create({
                codigo: viaje.codigo,
                codigoreserva: bookingId,
                codigoboleta: null,
                fechagenerada: new Date()
            });

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
    async obtenerReservasPendientes() {
        try {
            return await this.repository.findReservasPending();
        } catch (error) {
            console.error('Error getting pending bookings:', error);
            throw new Error('Error al obtener las reservas pendientes');
        }
    }

    /**
     * Gets all pending taxi bookings
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

    validarDatosBooking(datos) {
        if (!datos.origenv || !datos.destinov) {
            throw new Error('Origen y destino son obligatorios');
        }
        if (!datos.freserva) {
            throw new Error('Fecha de reserva es obligatoria');
        }
        if (!datos.tipo) {
            throw new Error('Tipo de reserva es obligatorio');
        }

        const fechaReserva = new Date(datos.freserva);
        const fechaActual = new Date();

        if (fechaReserva < fechaActual) {
            throw new Error('Fecha de reserva no puede ser en el pasado');
        }
    }

    async crearEntradaHistorial(trx, estado) {
        const [historial] = await trx('historial')
            .insert({
                fcambio: new Date(),
                estadoh: estado
            })
            .returning('*');
        return historial;
    }
}

export default BookingService;
