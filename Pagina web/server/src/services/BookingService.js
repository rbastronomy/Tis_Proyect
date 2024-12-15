import { BaseService } from "../core/BaseService.js";
import BookingRepository from "../repository/BookingRepository.js";
import { TaxiService } from "./TaxiService.js";
import { ServiceService } from './ServiceService.js';
import { RateService } from './RateService.js';
import { BookingModel } from '../models/BookingModel.js';
import { HistoryService } from './HistoryService.js';
import { OfferingService } from "./OfferingService.js";
import { UserService } from "./UserService.js";
import { ReceiptService } from "./ReceiptService.js";

export class BookingService extends BaseService {
    constructor() {
        const bookingRepository = new BookingRepository();
        super(bookingRepository);
        this.taxiService = new TaxiService();
        this.serviceService = new ServiceService();
        this.rateService = new RateService();
        this.historyService = new HistoryService();
        this.offeringService = new OfferingService();
        this.userService = new UserService();
        this.receiptService = new ReceiptService();
    }

    /**
     * Creates a new booking with its initial history entry
     * @param {Object} bookingData - Data for the new booking
     * @returns {Promise<{booking: BookingModel, history: HistoryModel}>} Created booking and history entry
     * @throws {Error} If creation fails
     */
    async createBooking(bookingData) {
        try {
            const offeringId = await this.offeringService.findIdByServiceAndRate(
                bookingData.codigo_servicio, 
                bookingData.id_tarifa
            );

            if (!offeringId) {
                throw new Error('Oferta no encontrada');
            }
            
            // Remove service and rate IDs from booking data since they're not part of the domain model
            const { codigo_servicio, id_tarifa, ...bookingModelData } = bookingData;
            console.log(bookingData)
            
            // Create and validate booking model before saving
            const bookingModel = BookingModel.toModel(bookingModelData);

            const bookingJSON = bookingModel.toJSON()

            console.log(bookingJSON)

            return await this.repository.transaction(async (trx) => {
                // The repository will handle mapping the model to DB structure including id_oferta
                const dbBooking = {
                    ...bookingModel.toJSON(),
                    id_oferta: offeringId,
                    rut_conductor: null,
                    patente_taxi: null
                };

                const rawBooking = await this.repository.create(dbBooking, trx);
                
                // Update the model with the saved data (excluding DB-specific fields)
                const { id_oferta, rut_conductor, patente_taxi, ...modelData } = rawBooking;
                bookingModel.update(modelData);
                
                // Create the history entry using the same transaction
                const historyEntry = await this.historyService.createHistoryEntryWithTransaction(
                    trx,
                    'CREACION',
                    rawBooking.codigo_reserva
                );

                bookingModel.history.push(historyEntry);

                return bookingModel;
            });
        } catch (error) {
            console.error('Error creating booking:', error);
            throw new Error(`Error al crear reserva: ${error.message}`);
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
            const serviceTariffs = await this.serviceService.getTariffsByType(bookingData.codigo_servicio, bookingData.rideType);
            const isValidTariff = serviceTariffs.some(tariff => tariff.id_tarifa === bookingData.tarifa_id);
            
            if (!isValidTariff) {
                throw new Error('La tarifa seleccionada no es válida para este servicio');
            }

            const historial = await this.HistoryRepository.create({
                estadoh: 'RESERVA_CREADA',
                fcambio: new Date()
            });

            const { codigo_servicio, tarifa_id, ...reservaData } = bookingData;

            const booking = await this.repository.create({
                ...reservaData,
                idhistorial: historial.idhistorial,
                estados: 'EN_REVISION'
            });

            await this.solicitaRepository.create({
                rut: userId,
                codigoreserva: booking.codigoreserva,
                codigo_servicio: codigo_servicio,
                fechasolicitud: new Date()
            });

            const [service, tariff] = await Promise.all([
                this.serviceService.findByCodigos(codigo_servicio),
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
            console.log('Validating booking:', { bookingId, action, rutConductor, patenteTaxi });
            
            const bookingCode = Number(bookingId);
            if (isNaN(bookingCode)) {
                throw new Error('Código de reserva inválido');
            }

            const booking = await this.repository.findById(bookingCode);
            if (!booking) {
                throw new Error('Reserva no encontrada');
            }

            // Allow validation only for EN_REVISION or reassignment for PENDIENTE
            if (booking.estado_reserva !== 'EN_REVISION' && booking.estado_reserva !== 'PENDIENTE') {
                throw new Error('La reserva no puede ser modificada en su estado actual');
            }

            // Create history entry using transaction
            return await this.repository.transaction(async (trx) => {
                // Map actions to valid history actions
                let historyAction;
                if (booking.estado_reserva === 'EN_REVISION') {
                    historyAction = action === 'APROBAR' ? 'CONFIRMACION' : 'MODIFICACION';
                } else {
                    historyAction = 'MODIFICACION';
                }

                // Create history entry
                const historyEntry = await this.historyService.createHistoryEntryWithTransaction(
                    trx,
                    historyAction,
                    bookingCode,
                    {
                        observacion_historial: motivo || (action === 'APROBAR' ? 
                            'Reserva aprobada y conductor asignado' : 
                            'Conductor reasignado')
                    }
                );

                // Update booking data
                const updateData = {
                    updated_at: new Date()
                };

                // Only update estado_reserva if it's in EN_REVISION
                if (booking.estado_reserva === 'EN_REVISION') {
                    updateData.estado_reserva = action === 'APROBAR' ? 'PENDIENTE' : 'RECHAZADO';
                }

                // Update driver and taxi assignment
                if (action === 'APROBAR' || booking.estado_reserva === 'PENDIENTE') {
                    updateData.rut_conductor = rutConductor;
                    updateData.patente_taxi = patenteTaxi;
                }

                // Update booking with transaction
                const updatedBooking = await this.repository.update(
                    bookingCode, 
                    updateData, 
                    trx
                );

                return BookingModel.toModel({
                    ...updatedBooking,
                    history: historyEntry
                });
            });
        } catch (error) {
            console.error('Error validating booking:', error);
            throw new Error(`Error validating booking: ${error.message}`);
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

        const receiptData = {
            codigo_reserva: codigo_reserva,
            total: booking.total,
            fecha_emision: new Date(),
            metodo_pago: 'Cancelado',
            descripcion_boleta: 'Reserva cancelada'
        };
        await this.receiptService.create(receiptData);
    
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

            const receiptData ={
                codigoReserva: bookingId,
                total: booking.total,
                fecha_emision: new Date(),
                metodo_pago: 'efectivo',
                descripcion_boleta: 'Viaje completado',
            };
            await this.receiptService.create(receiptData);

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

    /**
     * Gets a specific booking by its code with full details
     * @param {number} codigoReserva - The booking code to find
     * @returns {Promise<BookingModel|null>} The found booking or null
     * @throws {Error} If retrieval fails
     */
    async getBookingByCode(codigoReserva) {
        try {
            console.log('BookingService - Getting booking:', codigoReserva);
            
            const rawBooking = await this.repository.findByCodigoReserva(codigoReserva);
            console.log('BookingService - Raw booking data:', rawBooking);
            
            if (!rawBooking) {
                return null;
            }

            // Get the offering to get service and rate IDs
            const offering = await this.offeringService.findById(rawBooking.id_oferta);
            console.log('BookingService - Offering data:', offering);
            
            if (!offering) {
                throw new Error('Oferta asociada no encontrada');
            }

            // Fetch all related data in parallel
            console.log('BookingService - Fetching related data...');
            const [
                serviceModel, 
                rateModel,
                historyEntries,
                taxiData,
                clienteData
            ] = await Promise.all([
                this.serviceService.findByCodigos(offering.codigo_servicio),
                this.rateService.findById(offering.id_tarifa),
                this.historyService.getBookingHistory(codigoReserva),
                rawBooking.patente_taxi ? 
                    this.taxiService.getTaxiByLicensePlate(rawBooking.patente_taxi) : 
                    null,
                rawBooking.rut_cliente ?
                    this.userService.findByRut(rawBooking.rut_cliente) :
                    null
            ]);

            console.log('BookingService - Related data fetched:', {
                service: serviceModel?.toJSON(),
                rate: rateModel?.toJSON(),
                history: historyEntries?.map(h => h.toJSON()),
                taxi: taxiData?.toJSON(),
                client: clienteData?.toJSON()
            });

            // Create a domain model with all the information
            const bookingModel = new BookingModel({
                ...rawBooking,
                servicio: serviceModel ? {
                    tipo: serviceModel.tipo_servicio,
                    descripcion: serviceModel.descripcion_servicio
                } : null,
                tarifa: rateModel ? {
                    precio: rateModel.precio,
                    descripcion: rateModel.descripcion_tarifa,
                    tipo: rateModel.tipo_tarifa
                } : null,
                history: historyEntries,
                taxi: taxiData ? {
                    patente: taxiData.patente,
                    marca: taxiData.marca,
                    modelo: taxiData.modelo,
                    color: taxiData.color,
                    ano: taxiData.ano,
                    estado_taxi: taxiData.estado_taxi,
                    vencimiento_revision_tecnica: taxiData.vencimiento_revision_tecnica,
                    vencimiento_permiso_circulacion: taxiData.vencimiento_permiso_circulacion,
                    conductor: taxiData.conductor ? {
                        rut: taxiData.conductor.rut,
                        nombre: taxiData.conductor.nombre,
                        apellido: taxiData.conductor.apellido,
                        correo: taxiData.conductor.correo,
                        telefono: taxiData.conductor.telefono
                    } : null
                } : null,
                cliente: clienteData ? {
                    rut: clienteData.rut,
                    nombre: clienteData.nombre,
                    apellido: clienteData.apellido,
                    correo: clienteData.correo,
                    telefono: clienteData.telefono
                } : null,
                created_at: rawBooking.created_at,
                updated_at: rawBooking.updated_at,
                deleted_at_reserva: rawBooking.deleted_at_reserva
            });

            const finalData = bookingModel.toJSON();
            console.log('BookingService - Final booking data:', finalData);
            return bookingModel;
        } catch (error) {
            console.error('BookingService - Error:', error);
            throw new Error(`Error al obtener la reserva: ${error.message}`);
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
    /**
     * Gets bookings for a specific client
     * @param {number} clientRut - Client's RUT
     * @returns {Promise<Array>} Client's bookings
     * @throws {Error} If retrieval fails
     */
    async getClientBookings(clientRut) {
        try {
            const bookings = await this.repository.findWithFilters({
                rut_cliente: clientRut
            });
            return bookings.map(booking => {
                const { rut_conductor, ...publicData } = booking;
                return publicData;
            });
        } catch (error) {
            console.error('Error getting client bookings:', error);
            throw new Error(`Error al obtener las reservas del cliente: ${error.message}`);
        }
    }
    /**
     * Retrieves bookings for a specific driver.
     * @param {number} driverId - The ID of the driver
     * @returns {Promise<Array>} - List of bookings
     * @throws {Error} If retrieval fails
     */
    async getDriverBookings(driverId) {
        try {
            const bookings = await this.repository.findBookingsByDriver(driverId);
            console.log('BookingService - Driver bookings:', bookings);
            return bookings;
        } catch (error) {
            console.error('Error getting driver bookings:', error);
            throw new Error(`Error al obtener las reservas del conductor: ${error.message}`);
        }
    }
}

export default BookingService;
