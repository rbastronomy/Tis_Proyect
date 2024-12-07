import { BaseModel } from "../core/BaseModel.js";
import { UserModel } from './UserModel.js';
import { TaxiModel } from './TaxiModel.js';
import { TripModel } from './TripModel.js';
import { ServiceModel } from './ServiceModel.js';
import { HistoryModel } from './HistoryModel.js';

/**
 * @typedef {Object} BookingData
 * @property {number} codigo_reserva - The unique identifier for the booking.
 * @property {string} rut_cliente - The RUT of the client.
 * @property {number} id_oferta - The ID of the offering.
 * @property {number} id_asignacion_taxis - The ID of the offering.
 * @property {string} origen_reserva - The origin of the reservation.
 * @property {string} destino_reserva - The destination of the reservation.
 * @property {Date} fecha_reserva - The date of the reservation.
 * @property {Date} fecha_realizado - The date of the reservation.
 * @property {string} tipo_reserva - The type of the reservation.
 * @property {string} observacion_reserva - The observation of the reservation.
 * @property {string} estado_reserva - The state of the reservation.
 * @property {Date} deleted_at_reserva - The date of the reservation.
 * @property {number} createdAt - The date of the reservation(Knex timestamps).
 * @property {number} updatedAt - The date of the reservation(Knex timestamps).
 */

export class BookingModel extends BaseModel {
    static defaultData = {
        // Campos de la tabla 'reserva'
        codigo_reserva: null,    // ID de la reserva
        origen_reserva: '',            // Origen
        destino_reserva: '',           // Destino
        fecha_reserva: null,         // Fecha de reserva
        fecha_realizado: null,       // Fecha de realización
        tipo_reserva: 'NORMAL',         // Tipo de reserva
        observacion_reserva: '',        // Observaciones
        estado_reserva: 'EN_REVISION', // Estado
        deleted_at_reserva: null,      // Soft delete

        // Modelos relacionados
        driver: null,           // Conductor (UserModel)
        taxi: null,             // Taxi (TaxiModel)
        trip: null,             //viaje (TripModel)
        client: null,           // Cliente (UserModel)
        service: null,          // Servicio (ServiceModel)
        history: [],          // Historial de reservas (BookingHistoryModel)
    };

    constructor(data = {}) {
        // Manejar instancias de modelos si se proporcionan directamente
        const modelData = {
            ...data,
            driver: data.driver instanceof UserModel ? data.driver : null,
            taxi: data.taxi instanceof TaxiModel ? data.taxi : null,
            trip: data.trip instanceof TripModel ? data.trip : null,
            client: data.client instanceof UserModel ? data.client : null,
            service: data.service instanceof ServiceModel ? data.service : null,
            history: data.history instanceof HistoryModel ? data.history : [],
        };

        super(modelData, BookingModel.defaultData);

        // Inicializar modelos si se proporcionan datos crudos
        if (data.driver && !(data.driver instanceof UserModel)) {
            this._data.driver = new UserModel(data.driver);
        }
        if (data.taxi && !(data.taxi instanceof TaxiModel)) {
            this._data.taxi = new TaxiModel(data.taxi);
        }
        if (data.trip && !(data.trip instanceof TripModel)) {
            this._data.trip = new TripModel(data.trip);
        }
        if (data.client && !(data.client instanceof UserModel)) {
            this._data.client = new UserModel(data.client);
        }
        if (data.service && !(data.service instanceof ServiceModel)) {
            this._data.service = new ServiceModel(data.service);
        }
        this._data.history = Array.isArray(data.history) ? data.history : []; 

    }

    // Getters básicos (mantienen nombres de BD)
    get codigoreserva() { return this._data.codigoreserva; }
    get origenv() { return this._data.origenv; }
    get destinov() { return this._data.destinov; }
    get freserva() { return this._data.freserva; }
    // Getters de relaciones (nombres en inglés)
    get driver() { return this._data.driver; }
    get taxi() { return this._data.taxi; }
    get trip() { return this._data.trip; }
    get client() { return this._data.client; }
    get service() { return this._data.service; }
    get history() { return this._data.history; }
    

    // Métodos de estado
    isPending() { return this._data.estados === 'PENDIENTE'; }
    isConfirmed() { return this._data.estados === 'CONFIRMADO'; }
    canBeAssigned() { return this._data.estados === 'EN_REVISION'; }
    canBeCancelled() { return ['EN_REVISION', 'PENDIENTE'].includes(this._data.estados); }
    
    // Métodos de relaciones
    hasDriver() { return !!this._data.driver; }
    hasTaxi() { return !!this._data.taxi; }
    hasTrip() { return !!this._data.trip; }

    /**
     * Creates a BookingModel instance from a database entity
     * @param {BookingData} entity - Database entity object
     * @returns {BookingModel|null} - Returns null if entity is null/undefined
     */
    static fromEntity(entity) {
        if (!entity) return null;
        
        const booking = new BookingModel({
            codigo_reserva: entity.codigo_reserva,
            rut_cliente: entity.rut_cliente,
            id_oferta: entity.id_oferta,
            id_asignacion_taxis: entity.id_asignacion_taxis,
            origen_reserva: entity.origen_reserva,
            destino_reserva: entity.destino_reserva,
            fecha_reserva: entity.fecha_reserva,
            fecha_realizado: entity.fecha_realizado,
            tipo_reserva: entity.tipo_reserva,
            observacion_reserva: entity.observacion_reserva,
            estado_reserva: entity.estado_reserva,
            deleted_at_reserva: entity.deleted_at_reserva,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        });
        
        return booking;
    }

    // Métodos para relaciones ternarias
    addGenerate(trip, Receipt = null) {
        const generateRecord = {
            codigo: trip.codigo,
            codigoreserva: this.codigoreserva,
            codigoboleta: Receipt?.codigoboleta || null,
            fechagenerada: new Date()
        };
        this._data.genera.push(generateRecord);
        return generateRecord;
    }

    // Método para calcular costo estimado
    calculateEstimatedCost() {
        if (this._data.service.rate) {
            this._data.costo_estimado = this._data.service.rate.precio;
        }
        return this._data.costo_estimado;
    }

    toJSON() {
        const json = {
            codigo_reserva: this._data.codigoreserva,
            rut_conductor: this._data.rut_conductor,
            patente_taxi: this._data.patente_taxi,
            origen_reserva: this._data.origen_reserva,
            destino_reserva: this._data.destino_reserva,
            fecha_reserva: this._data.fecha_reserva,
            fecha_realizado: this._data.fecha_realizado,
            tipo_reserva: this._data.tipo_reserva,
            observacion_reserva: this._data.observacion_reserva,
            estado_reserva: this._data.estado_reserva,
            deleted_at_reserva: this._data.deleted_at_reserva,
            genera: this._data.genera,
            costo_estimado: this._data.costo_estimado,
        };

        // Add related models
        if (this._data.driver) json.driver = this._data.driver.toJSON();
        if (this._data.taxi) json.taxi = this._data.taxi.toJSON();
        if (this._data.client) json.client = this._data.client.toJSON();
        if (this._data.service) json.service = this._data.service.toJSON();
        if (this._data.trip) json.trip = this._data.trip.toJSON();
        if (this._data.history) json.history = this._data.history.map(history => history.toJSON());

        return json;
    }

    static fromDB(data) {
        if (!data) return null;
        return new BookingModel(data);
    }

    // Add missing getters
    get rut_conductor() { return this._data.rut_conductor; }
    get patente_taxi() { return this._data.patente_taxi; }
    get tipo_reserva() { return this._data.tipo_reserva; }
    get estado_reserva() { return this._data.estado_reserva; }
    get fecha_realizado() { return this._data.fecha_realizado; }
    get codigo_servicio() { return this._data.codigos; }
    get genera() { return this._data.genera; }
    get costo_estimado() { return this._data.costo_estimado; }

    // Add missing setters for model relationships
    set driver(value) { 
        this._data.driver = value instanceof UserModel ? value : new UserModel(value); 
    }

    set taxi(value) { 
        this._data.taxi = value instanceof TaxiModel ? value : new TaxiModel(value); 
    }


    set client(value) { 
        this._data.client = value instanceof UserModel ? value : new UserModel(value); 
    }

    // Add missing domain methods
    isActive() {
        return !this._data.deleted_at_reserva;
    }

    canBeStarted() {
        return this._data.estado_reserva === 'PENDIENTE' && this.hasDriver();
    }

    canBeCompleted() {
        return this._data.estado_reserva === 'EN_CAMINO';
    }

    // Add missing model-specific methods
    isDriverAvailable() {
        return this._data.driver?.isActive() && 
               this._data.driver?.hasRole('CONDUCTOR');
    }

    isTaxiAvailable() {
        return this._data.taxi?.isAvailable();
    }

    getServiceType() {
        return this._data.service?.tipo_servicio;
    }

    associateTrip(tripModel) {
        this._data.trip = tripModel;
        this._data.trip_info = {
            duracion_viaje: tripModel.duracion_viaje,
            observacion_viaje: tripModel.observacion_viaje,
            fecha_viaje: tripModel.fecha_viaje
        };
    }

    associateReceipt(receiptModel) {
        this._data.boleta = receiptModel;
        this._data.boleta_info = {
            total: receiptModel.total,
            fecha_emision: receiptModel.fecha_emision,
            metodo_pago: receiptModel.metodo_pago,
            descripcion_tarifa: receiptModel.descripcion_tarifa
        };
    }

    // Método para agregar relación servicio-tarifa
    addServiceRate(serviceId, rateId) {
        this._data.service_rate = {
            codigo_servicio: serviceId,
            id_tarifa: rateId,
        };
    }
}