import { BaseModel } from "../core/BaseModel.js";
import { UserModel } from './UserModel.js';
import { TaxiModel } from './TaxiModel.js';
import { ServiceModel } from './ServiceModel.js';
import { TripModel } from './TripModel.js';
import { OfferingModel } from './OfferingModel.js';

export class BookingModel extends BaseModel {
    static defaultData = {
        // Campos de la tabla 'reserva'
        codigoreserva: null,    // ID de la reserva
        rut_conductor: null,    // RUT del conductor
        patente_taxi: null,     // Patente del taxi
        origenv: '',            // Origen
        destinov: '',           // Destino
        freserva: null,         // Fecha de reserva
        frealizado: null,       // Fecha de realización
        tipo: 'NORMAL',         // Tipo de reserva
        observacion: '',        // Observaciones
        estados: 'EN_REVISION', // Estado
        deletedatre: null,      // Soft delete
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
    get codigoreserva() { return this._data.codigoreserva; }
    get origenv() { return this._data.origenv; }
    get destinov() { return this._data.destinov; }
    get freserva() { return this._data.freserva; }
    // Getters de relaciones (nombres en inglés)
    get driver() { return this._data.driver; }
    get taxi() { return this._data.taxi; }
    // ... (resto de getters de relaciones)
    

    // Métodos de estado
    isPending() { return this._data.estados === 'PENDIENTE'; }
    isConfirmed() { return this._data.estados === 'CONFIRMADO'; }
    canBeAssigned() { return this._data.estados === 'EN_REVISION'; }
    canBeCancelled() { return ['EN_REVISION', 'PENDIENTE'].includes(this._data.estados); }
    
    // Métodos de relaciones
    hasDriver() { return !!this._data.driver; }
    hasTaxi() { return !!this._data.taxi; }
    hasTrip() { return !!this._data.trip; }

    // Métodos para relaciones ternarias
    addGenerate(trip, invoice = null) {
        const generateRecord = {
            codigo: trip.codigo,
            codigoreserva: this.codigoreserva,
            codigoboleta: invoice?.codigoboleta || null,
            fechagenerada: new Date()
        };
        this._data.generates.push(generateRecord);
        return generateRecord;
    }

    addRequest(serviceId) {
        this._data.requests = {
            codigoreserva: this.codigoreserva,
            codigos: serviceId,
            fechasolicitud: new Date()
        };
    }

    addBookingRate(rateId) {
        this._data.booking_rate = {
            codigoreserva: this.codigoreserva,
            id: rateId,
            fechaseleccion: new Date()
        };
    }

    // Método para calcular costo estimado
    calculateEstimatedCost() {
        if (this._data.rate) {
            this._data.costo_estimado = this._data.rate.precio;
        }
        return this._data.costo_estimado;
    }

    toJSON() {
        const json = {
            codigoreserva: this._data.codigoreserva,
            codigo: this._data.codigo,
            codigoboleta: this._data.codigoboleta,
            idhistorial: this._data.idhistorial,
            rut_conductor: this._data.rut_conductor,
            patente_taxi: this._data.patente_taxi,
            origenv: this._data.origenv,
            destinov: this._data.destinov,
            freserva: this._data.freserva,
            frealizado: this._data.frealizado,
            tipo: this._data.tipo,
            observacion: this._data.observacion,
            estados: this._data.estados,
            codigos: this._data.codigos,
            generates: this._data.generates,
            costo_estimado: this._data.costo_estimado,
            tarifa_id: this._data.tarifa_id,
            service_rate: this._data.service_rate,
            requests: this._data.requests,
            booking_rate: this._data.booking_rate,
            trip_info: this._data.trip_info,
            invoice_info: this._data.invoice_info
        };

        // Add related models
        if (this._data.driver) json.driver = this._data.driver.toJSON();
        if (this._data.taxi) json.taxi = this._data.taxi.toJSON();
        if (this._data.history) json.history = this._data.history.toJSON();
        if (this._data.service) json.service = this._data.service.toJSON();
        if (this._data.trip) json.trip = this._data.trip.toJSON();
        if (this._data.client) json.client = this._data.client.toJSON();
        if (this._data.rate) json.rate = this._data.rate.toJSON();

        return json;
    }

    static fromDB(data) {
        if (!data) return null;
        return new BookingModel(data);
    }

    // Add missing getters
    get idhistorial() { return this._data.idhistorial; }
    get rut_conductor() { return this._data.rut_conductor; }
    get patente_taxi() { return this._data.patente_taxi; }
    get tipo() { return this._data.tipo; }
    get estados() { return this._data.estados; }
    get frealizado() { return this._data.frealizado; }
    get codigos() { return this._data.codigos; }
    get generates() { return this._data.generates; }
    get costo_estimado() { return this._data.costo_estimado; }
    get tarifa_id() { return this._data.tarifa_id; }
    get rate() { return this._data.rate; }

    // Add missing setters for model relationships
    set driver(value) { 
        this._data.driver = value instanceof UserModel ? value : new UserModel(value); 
    }

    set taxi(value) { 
        this._data.taxi = value instanceof TaxiModel ? value : new TaxiModel(value); 
    }

    set history(value) { 
        this._data.history = value instanceof HistoryModel ? value : new HistoryModel(value); 
    }

    set service(value) { 
        this._data.service = value instanceof ServiceModel ? value : new ServiceModel(value); 
    }

    set trip(value) { 
        this._data.trip = value instanceof TripModel ? value : new TripModel(value); 
    }

    set client(value) { 
        this._data.client = value instanceof UserModel ? value : new UserModel(value); 
    }

    // Add missing domain methods
    isActive() {
        return !this._data.deletedatre;
    }

    canBeStarted() {
        return this._data.estados === 'PENDIENTE' && this.hasDriver();
    }

    canBeCompleted() {
        return this._data.estados === 'EN_CAMINO';
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
        return this._data.service?.tipo;
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
            tipo: this._data.tipo,
            estados: this._data.estados,
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