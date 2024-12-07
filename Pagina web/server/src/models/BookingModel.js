import { BaseModel } from "../core/BaseModel.js";
import { UserModel } from './UserModel.js';
import { TaxiModel } from './TaxiModel.js';
import { ServiceModel } from './ServiceModel.js';
import { TripModel } from './TripModel.js';
import { OfferingModel } from './OfferingModel.js';

export class BookingModel extends BaseModel {
    static defaultData = {
        // Campos de la tabla 'reserva'
        codigo_reserva: null,    // ID de la reserva
        rut_conductor: null,    // RUT del conductor
        patente_taxi: null,     // Patente del taxi
        origen_reserva: '',            // Origen
        destino_reserva: '',           // Destino
        fecha_reserva: null,         // Fecha de reserva
        fecha_realizado: null,       // Fecha de realización
        tipo_reserva: 'NORMAL',         // Tipo de reserva
        observacion_reserva: '',        // Observaciones
        estado_reserva: 'EN_REVISION', // Estado
        deleted_at_reserva: null,      // Soft delete
        costo_estimado: 0,      // Costo estimado
        oferta_id: null,        // ID de la oferta

        // Modelos relacionados
        driver: null,           // Conductor (UserModel)
        taxi: null,             // Taxi (TaxiModel)
        //trip: null,             // Viaje (TripModel)
        client: null,           // Cliente (UserModel)
        offering: null,         // oferta (OfferingModel)

        // Relaciones ternarias
        generates: [],          // Relación viaje-reserva-boleta
    };

    constructor(data = {}) {
        // Manejar instancias de modelos si se proporcionan directamente
        const modelData = {
            ...data,
            driver: data.driver instanceof UserModel ? data.driver : null,
            taxi: data.taxi instanceof TaxiModel ? data.taxi : null,
            trip: data.trip instanceof TripModel ? data.trip : null,
            client: data.client instanceof UserModel ? data.client : null,
            offering: data.rate instanceof OfferingModel ? data.offering : null
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
        if (data.offering && !(data.offering instanceof OfferingModel)) {
            this._data.offering = new OfferingModel(data.offering);
        }

        // Initialize arrays and relationships
        this._data.generates = Array.isArray(data.generates) ? data.generates : [];
        this._data.trip_info = data.trip_info || null;
        this._data.requests = data.requests || null;
    }

    // Getters básicos (mantienen nombres de BD)
    get codigo_reserva() { return this._data.codigo_reserva; }
    get origen_reserva() { return this._data.origen_reserva; }
    get destino_reserva() { return this._data.destino_reserva; }
    get fecha_reserva() { return this._data.fecha_reserva; }
    // Getters de relaciones (nombres en inglés)
    get driver() { return this._data.driver; }
    get taxi() { return this._data.taxi; }
    // ... (resto de getters de relaciones)
    

    // Métodos de estado
    isPending() { return this._data.estado_reserva === 'PENDIENTE'; }
    isConfirmed() { return this._data.estado_reserva === 'CONFIRMADO'; }
    canBeAssigned() { return this._data.estado_reserva === 'EN_REVISION'; }
    canBeCancelled() { return ['EN_REVISION', 'PENDIENTE'].includes(this._data.estado_reserva); }
    
    // Métodos de relaciones
    hasDriver() { return !!this._data.driver; }
    hasTaxi() { return !!this._data.taxi; }
    hasTrip() { return !!this._data.trip; }

    // Métodos para relaciones ternarias
    addGenerate(trip, invoice = null) {
        const generateRecord = {
            codigo: trip.codigo,
            codigo_reserva: this.codigo_reserva,
            codigoboleta: invoice?.codigoboleta || null,
            fechagenerada: new Date()
        };
        this._data.generates.push(generateRecord);
        return generateRecord;
    }


    addBookingOffering(offeringId) {
        this._data.offering = {
            codigos: this.codigos,
            idtarifa: id_tarifa,
        };
    }

    // Método para calcular costo estimado
    calculateEstimatedCost() {
        if (this._data.offering) {
            this._data.costo_estimado = this._data.offering.rate.precio;
        }
        return this._data.costo_estimado;
    }

    toJSON() {
        const json = {
            codigo_reserva: this._data.codigo_reserva,
            rut_conductor: this._data.rut_conductor,
            patente_taxi: this._data.patente_taxi,
            origen_reserva: this._data.origen_reserva,
            destino_reserva: this._data.destino_reserva,
            fecha_reserva: this._data.fecha_reserva,
            fecha_realizado: this._data.fecha_realizado,
            tipo_reserva: this._data.tipo_reserva,
            observacion_reserva: this._data.observacion_reserva,
            estado_reserva: this._data.estado_reserva,
            generates: this._data.generates,
            costo_estimado: this._data.costo_estimado,
            offering: this._data.offering
        };

        // Add related models
        if (this._data.driver) json.driver = this._data.driver.toJSON();
        if (this._data.taxi) json.taxi = this._data.taxi.toJSON();
        if (this._data.client) json.client = this._data.client.toJSON();
        if (this._data.offering) json.offering = this._data.offering.toJSON();

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
    get codigos() { return this._data.codigos; }
    get generates() { return this._data.generates; }
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
        return !this._data.deletedatre;
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
        return this._data.service?.tipo_reserva;
    }

    associateTrip(tripModel) {
        this._data.trip = tripModel;
        this._data.trip_info = {
            duration: tripModel.duracionv,
            observation: tripModel.observacionv,
            date: tripModel.fechav
        };
    }

    associateInvoice(invoiceModel) {
        this._data.invoice = invoiceModel;
        this._data.invoice_info = {
            total: invoiceModel.total,
            date: invoiceModel.femision,
            payment_method: invoiceModel.metodopago,
            description: invoiceModel.descripciont
        };
    }

    // Update toJSON to include new fields
    toJSON() {
        const json = {
            ...super.toJSON(),
            idhistorial: this._data.idhistorial,
            rut_conductor: this._data.rut_conductor,
            patente_taxi: this._data.patente_taxi,
            tipo_reserva: this._data.tipo_reserva,
            estado_reserva: this._data.estado_reserva,
            codigos: this._data.codigos,
            generates: this._data.generates,
            costo_estimado: this._data.costo_estimado,
            tarifa_id: this._data.tarifa_id
        };

        // Add related models
        if (this._data.rate) json.rate = this._data.rate.toJSON();
        if (this._data.trip_info) json.trip_info = this._data.trip_info;
        if (this._data.invoice_info) json.invoice_info = this._data.invoice_info;

        return json;
    }

    // Método para agregar relación servicio-tarifa
    addServiceRate(serviceId, rateId) {
        this._data.service_rate = {
            codigos: serviceId,
            id: rateId,
            fechaseleccion: new Date()
        };
    }
}