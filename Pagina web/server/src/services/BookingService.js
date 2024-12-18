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
import { HistoryModel } from "../models/HistoryModel.js";
import { TripModel } from "../models/TripModel.js";

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

                        
            // Ensure client RUT is present
            if (!bookingData.rut_cliente) {
                throw new Error('RUT del cliente es requerido');
            }

            // Verify client exists
            const clientData = await this.userService.getByRut(bookingData.rut_cliente);
            if (!clientData) {
                throw new Error('Cliente no encontrado');
            }

            
            // Remove fields that shouldn't go to the database
            const { 
                codigo_servicio, 
                id_tarifa, 
                servicio,  // Remove this
                tarifas,   // Remove this
                ...bookingModelData 
            } = bookingData;
            
            // Create and validate booking model before saving
            const bookingModel = BookingModel.toModel(bookingModelData);

            return await this.repository.transaction(async (trx) => {
                // The repository will handle mapping the model to DB structure including id_oferta
                const dbBooking = {
                    ...bookingModel.toJSON(),
                    id_oferta: offeringId,
                    rut_cliente: bookingData.rut_cliente,
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
                            'Conductor reasignado'),
                        estado_historial: action === 'APROBAR' ? 'RESERVA_CONFIRMADA' : 'RESERVA_RECHAZADA'
    
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
     * @param {number} codigo_reserva - Booking code
     * @returns {Promise<Object>} Cancelled booking
     * @throws {Error} If cancellation fails
     */
    async cancelBooking(codigo_reserva) {
        try {
            const booking = await this.repository.findById(codigo_reserva);
            
            if (!booking) {
                throw new Error('Reserva no encontrada');
            }

            // Check if booking can be cancelled
            if (!['EN_REVISION', 'PENDIENTE'].includes(booking.estado_reserva)) {
                throw new Error('La reserva no puede ser cancelada en su estado actual');
            }

            return await this.repository.transaction(async (trx) => {
                // Create history entry
                const historyEntry = await this.historyService.createHistoryEntryWithTransaction(
                    trx,
                    'CANCELACION',
                    codigo_reserva,
                    {
                        estado_historial: 'RESERVA_CANCELADA',
                        observacion_historial: 'Reserva cancelada por el cliente'
                    }
                );

                // Update booking status
                const updatedBooking = await this.repository.update(
                    codigo_reserva,
                    {
                        estado_reserva: 'CANCELADO',
                        updated_at: new Date()
                    },
                    trx
                );

                return new BookingModel({
                    ...updatedBooking,
                    history: [historyEntry]
                });
            });
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw new Error(`Error al cancelar la reserva: ${error.message}`);
        }
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
     * Completes a trip for a given booking
     * @param {number} bookingId - The booking ID
     * @param {string} driverId - The driver's RUT
     * @param {Object} [trx] - Optional transaction object
     * @returns {Promise<BookingModel>} The updated booking
     * @throws {Error} If booking not found or validation fails
     */
    async completeTrip(bookingId, driverId, trx = null) {
        try {
            // 1. Get current booking data
            const bookingData = await this.repository.findById(bookingId);
            if (!bookingData) {
                throw new Error('Reserva no encontrada');
            }

            // 2. Create booking model for validation
            const booking = new BookingModel(bookingData);

            // 3. Validate booking state
            if (booking.estado_reserva !== 'RECOGIDO') {
                throw new Error('La reserva debe estar en estado RECOGIDO para completar el viaje');
            }

            const doUpdate = async (transaction) => {
                // 5. Create history entry
                const historyEntry = await this.historyService.createHistoryEntryWithTransaction(
                    transaction,
                    'MODIFICACION',
                    bookingId,
                    {
                        estado_historial: 'RESERVA_COMPLETADA',
                        observacion_historial: 'Viaje completado por el conductor'
                    }
                );

                // 6. Update booking data
                const updateData = {
                    estado_reserva: 'COMPLETADO',
                    fecha_realizado: new Date(),
                    updated_at: new Date()
                };

                // 7. Update in database
                const updatedBooking = await this.repository.update(
                    bookingId,
                    updateData,
                    transaction
                );

                // 8. Return new booking model with updated data and history
                return new BookingModel({
                    ...bookingData,
                    ...updatedBooking,
                    history: [historyEntry]
                });
            };

            // Use provided transaction or create new one
            if (trx) {
                return await doUpdate(trx);
            } else {
                return await this.repository.transaction(doUpdate);
            }
        } catch (error) {
            console.error('Error completing trip:', error);
            throw new Error(`Error al completar viaje: ${error.message}`);
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
            const [serviceModel, rateModel, historyEntries, taxiData, clienteData] = await Promise.all([
                this.serviceService.findByCodigos(offering.codigo_servicio),
                this.rateService.findById(offering.id_tarifa),
                this.historyService.getBookingHistory(codigoReserva),
                rawBooking.patente_taxi ? 
                    this.taxiService.getTaxiByLicensePlate(rawBooking.patente_taxi) : 
                    null,
                rawBooking.rut_cliente ?
                    this.userService.getByRut(rawBooking.rut_cliente) :
                    null
            ]);

            if (!serviceModel) {
                throw new Error('Servicio no encontrado');
            }

            if (!rateModel) {
                throw new Error('Tarifa no encontrada');
            }

            // Attach the rate to the service
            serviceModel.tarifas = [rateModel];

            // Create a domain model with all the information
            const bookingModel = new BookingModel({
                ...rawBooking,
                servicio: {
                    codigo_servicio: serviceModel.codigo_servicio,
                    tipo_servicio: serviceModel.tipo_servicio,
                    descripcion_servicio: serviceModel.descripcion_servicio,
                    tarifas: [{
                        id_tarifa: rateModel.id_tarifa,
                        precio: rateModel.precio,
                        descripcion_tarifa: rateModel.descripcion_tarifa,
                        tipo_tarifa: rateModel.tipo_tarifa
                    }]
                },
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
                        apellido: taxiData.conductor.apellido_paterno,
                        correo: taxiData.conductor.correo,
                        telefono: taxiData.conductor.telefono
                    } : null
                } : null,
                cliente: clienteData
            });

            const finalData = bookingModel.toJSON();

            // Verify service and rate data is present
            if (!finalData.servicio?.tarifas?.[0]?.precio) {
                console.error('BookingService - Missing service/rate data:', {
                    rawBooking,
                    serviceModel: serviceModel?.toJSON(),
                    rateModel: rateModel?.toJSON(),
                    finalData
                });
                throw new Error('La reserva no tiene un servicio o tarifa válida');
            }

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

    
    /**
     * Gets a booking by code and filters sensitive data for client view
     * @param {number} codigoReserva - The booking code to find
     * @param {number} clientRut - The client's RUT for verification
     * @returns {Promise<BookingModel|null>} The filtered booking or null
     * @throws {Error} If retrieval fails or unauthorized
     */
    async getClientBookingByCode(codigoReserva, clientRut) {
        try {
            console.log('BookingService - Getting client booking:', codigoReserva);
            
            // Get raw booking data first
            const rawBooking = await this.repository.findByCodigoReserva(codigoReserva);
            
            if (!rawBooking) {
                return null;
            }

            if (rawBooking.rut_cliente === null) {
                console.log('Booking has no client assigned:', rawBooking);
                throw new Error('Reserva no tiene cliente asignado');
            }

            // Get client data from UserService
            const clientData = await this.userService.getByRut(clientRut);
            console.log('Client data:', clientData);

            if (!clientData) {
                throw new Error('Cliente no encontrado');
            }

            // Extract the actual RUT from the nested structure
            const actualClientRut = clientData._data?._data?.rut || clientData._data?.rut;

            // Verify ownership using client data
            if (rawBooking.rut_cliente !== actualClientRut) {
                console.log('Authorization failed:', {
                    bookingClientRut: rawBooking.rut_cliente,
                    requestingClientRut: actualClientRut
                });
                throw new Error('No autorizado para ver esta reserva');
            }

            // Rest of the code remains the same...
            const offering = await this.offeringService.findById(rawBooking.id_oferta);
            if (!offering) {
                throw new Error('Oferta asociada no encontrada');
            }

            const [serviceModel, rateModel, historyEntries, taxiData] = await Promise.all([
                this.serviceService.findByCodigos(offering.codigo_servicio),
                this.rateService.findById(offering.id_tarifa),
                this.historyService.getBookingHistory(codigoReserva),
                rawBooking.patente_taxi ? 
                    this.taxiService.getTaxiByLicensePlate(rawBooking.patente_taxi) : 
                    null
            ]);

            // Filter taxi data to only include public information
            const filteredTaxiData = taxiData ? {
                patente: taxiData.patente,
                marca: taxiData.marca,
                modelo: taxiData.modelo,
                color: taxiData.color,
                ano: taxiData.ano,
                estado_taxi: taxiData.estado_taxi,
                vencimiento_revision_tecnica: taxiData.vencimiento_revision_tecnica,
                vencimiento_permiso_circulacion: taxiData.vencimiento_permiso_circulacion
            } : null;

            // Filter history entries and convert them to HistoryModel instances
            const filteredHistory = historyEntries.map(entry => {
                // Create a HistoryModel instance for each entry
                return new HistoryModel({
                    id_historial: entry.id_historial,
                    estado_historial: entry.estado_historial,
                    fecha_cambio: entry.fecha_cambio,
                    observacion_historial: entry.observacion_historial || '',
                    accion: entry.accion || 'CREACION',
                    codigo_reserva: codigoReserva
                });
            });

            // Create a domain model with filtered information
            const bookingModel = new BookingModel({
                ...rawBooking,
                servicio: {
                    codigo_servicio: serviceModel.codigo_servicio,
                    tipo_servicio: serviceModel.tipo_servicio,
                    descripcion_servicio: serviceModel.descripcion_servicio,
                    tarifas: [{
                        id_tarifa: rateModel.id_tarifa,
                        precio: rateModel.precio,
                        descripcion_tarifa: rateModel.descripcion_tarifa,
                        tipo_tarifa: rateModel.tipo_tarifa
                    }]
                },
                history: filteredHistory,
                taxi: filteredTaxiData,
                cliente: this._mapClientData(clientData),
                // Remove sensitive fields
                rut_conductor: undefined,
                conductor: undefined
            });

            console.log('BookingService - Filtered booking data:', bookingModel.toJSON());
            return bookingModel;
        } catch (error) {
            console.error('BookingService - Error:', error);
            throw new Error(`Error getting client booking: ${error.message}`);
        }
    }

    /**
     * Maps user data from UserModel to client info object
     * @private
     * @param {UserModel} userData - User model instance
     * @returns {Object|null} Mapped client info or null
     */
    _mapClientData(userData) {
        if (!userData) return null;

        // Get the innermost data object
        const data = userData._data._data || userData._data;

        return {
            rut: data.rut,
            nombre: data.nombre || '',
            apellido: data.apellido_paterno || '',
            correo: data.correo || '',
            telefono: data.telefono || ''
        };
    }

    /**
     * Starts a trip and creates a history entry
     * @param {number} bookingId - Booking ID
     * @param {string} driverId - Driver's RUT
     * @returns {Promise<BookingModel>} Updated booking with new history
     * @throws {Error} If start fails
     */
    async startTripWithHistory(bookingId, driverId) {
        try {
            const booking = await this.repository.findById(bookingId);
            if (!booking) {
                throw new Error('Reserva no encontrada');
            }

            if (booking.estado_reserva !== 'PENDIENTE') {
                throw new Error('La reserva no está en estado pendiente');
            }

            if (booking.rut_conductor !== driverId) {
                throw new Error('No autorizado para iniciar este viaje');
            }

            return await this.repository.transaction(async (trx) => {
                // Create history entry
                const historyEntry = await this.historyService.createHistoryEntryWithTransaction(
                    trx,
                    'MODIFICACION',
                    bookingId,
                    {
                        estado_historial: 'RESERVA_EN_PROGRESO',
                        observacion_historial: 'Viaje iniciado por el conductor'
                    }
                );

                // Update booking status
                const updateData = {
                    estado_reserva: 'CONFIRMADO',
                    updated_at: new Date()
                };

                const updatedBooking = await this.repository.update(
                    bookingId,
                    updateData,
                    trx
                );

                return new BookingModel({
                    ...updatedBooking,
                    history: [historyEntry]
                });
            });
        } catch (error) {
            console.error('Error starting trip with history:', error);
            throw new Error(`Error al iniciar el viaje: ${error.message}`);
        }
    }

    /**
     * Marks a booking as picked up and creates history entry
     * @param {number} bookingId - Booking ID
     * @param {number} driverId - Driver's RUT
     * @returns {Promise<BookingModel>} Updated booking with new history
     * @throws {Error} If pickup fails
     */
    async markPickup(bookingId, driverId) {
        try {
            const booking = await this.repository.findById(bookingId);
            if (!booking) {
                throw new Error('Reserva no encontrada');
            }

            if (booking.estado_reserva !== 'CONFIRMADO') {
                throw new Error('La reserva debe estar confirmada para marcar recogida');
            }

            if (booking.rut_conductor !== driverId) {
                throw new Error('No autorizado para marcar recogida en este viaje');
            }

            return await this.repository.transaction(async (trx) => {
                // Create history entry
                const historyEntry = await this.historyService.createHistoryEntryWithTransaction(
                    trx,
                    'MODIFICACION',
                    bookingId,
                    {
                        estado_historial: 'RESERVA_EN_PROGRESO',
                        observacion_historial: 'Pasajero recogido por el conductor'
                    }
                );

                // Update booking status
                const updateData = {
                    estado_reserva: 'RECOGIDO',
                    updated_at: new Date()
                };

                const updatedBooking = await this.repository.update(
                    bookingId,
                    updateData,
                    trx
                );

                return new BookingModel({
                    ...updatedBooking,
                    history: [historyEntry]
                });
            });
        } catch (error) {
            console.error('Error marking pickup:', error);
            throw new Error(`Error al marcar recogida: ${error.message}`);
        }
    }

    /**
     * Updates an existing booking
     * @param {number} bookingId - ID of the booking to update
     * @param {number} clientRut - RUT of the client making the update
     * @param {Object} updateData - Data to update
     * @param {string} updateData.origen_reserva - New origin location
     * @param {string} updateData.destino_reserva - New destination location
     * @param {string} updateData.fecha_reserva - New date and time
     * @param {string} [updateData.observacion_reserva] - New observations
     * @returns {Promise<BookingModel>} Updated booking model
     * @throws {Error} If booking not found or cannot be updated
     */
    async updateBooking(bookingId, clientRut, updateData) {
        try {
            // Get the current booking using repository
            const booking = await this.repository.findById(bookingId);

            if (!booking) {
                throw new Error('Reserva no encontrada');
            }

            // Verify ownership
            if (booking.rut_cliente !== clientRut) {
                throw new Error('No autorizado para editar esta reserva');
            }

            // Check if booking can be edited
            if (!['EN_REVISION', 'PENDIENTE'].includes(booking.estado_reserva)) {
                throw new Error('La reserva no puede ser editada en su estado actual');
            }

            return await this.repository.transaction(async (trx) => {
                // Create history entry
                const historyEntry = await this.historyService.createHistoryEntryWithTransaction(
                    trx,
                    'MODIFICACION',
                    bookingId,
                    {
                        estado_historial: 'RESERVA_EN_REVISION',
                        observacion_historial: 'Reserva actualizada por el cliente'
                    }
                );

                // Update booking data
                const updatedBooking = await this.repository.update(
                    bookingId,
                    {
                        ...updateData,
                        updated_at: new Date()
                    },
                    trx
                );

                // Return new booking model with history
                return new BookingModel({
                    ...updatedBooking,
                    history: [historyEntry]
                });
            });
        } catch (error) {
            console.error('Error updating booking:', error);
            throw new Error(`Error al actualizar la reserva: ${error.message}`);
        }
    }

}

export default BookingService;
