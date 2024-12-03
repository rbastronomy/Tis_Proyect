import { BaseModel } from '../core/BaseModel.js';
import { UserModel } from './UserModel.js';
import { TaxiModel } from './TaxiModel.js';
import { ServiceModel } from './ServiceModel.js';
import { ViajeModel } from './ViajeModel.js';
import { HistorialModel } from './HistorialModel.js';

export class ReservaModel extends BaseModel {
  static defaultData = {
    codigoreserva: null,
    idhistorial: null,
    rut_conductor: null,
    patente_taxi: null,
    origenv: '',
    destinov: '',
    freserva: null,
    frealizado: null,
    tipo: 'NORMAL',
    observacion: '',
    estados: 'EN_REVISION',
    deletedatre: null,
    // Models
    conductor: null,
    taxi: null,
    historial: null,
    servicio: null,
    viaje: null,
    cliente: null
  };

  constructor(data = {}) {
    // Handle model instances if provided directly
    const modelData = {
      ...data,
      conductor: data.conductor instanceof UserModel ? data.conductor : null,
      taxi: data.taxi instanceof TaxiModel ? data.taxi : null,
      historial: data.historial instanceof HistorialModel ? data.historial : null,
      servicio: data.servicio instanceof ServiceModel ? data.servicio : null,
      viaje: data.viaje instanceof ViajeModel ? data.viaje : null,
      cliente: data.cliente instanceof UserModel ? data.cliente : null
    };

    super(modelData, ReservaModel.defaultData);

    // Set models if raw data is provided
    if (data.conductor && !(data.conductor instanceof UserModel)) {
      this._data.conductor = new UserModel(data.conductor);
    }
    if (data.taxi && !(data.taxi instanceof TaxiModel)) {
      this._data.taxi = new TaxiModel(data.taxi);
    }
    if (data.historial && !(data.historial instanceof HistorialModel)) {
      this._data.historial = new HistorialModel(data.historial);
    }
    if (data.servicio && !(data.servicio instanceof ServiceModel)) {
      this._data.servicio = new ServiceModel(data.servicio);
    }
    if (data.viaje && !(data.viaje instanceof ViajeModel)) {
      this._data.viaje = new ViajeModel(data.viaje);
    }
    if (data.cliente && !(data.cliente instanceof UserModel)) {
      this._data.cliente = new UserModel(data.cliente);
    }
  }

  // Basic getters
  get codigoreserva() { return this._data.codigoreserva; }
  get idhistorial() { return this._data.idhistorial; }
  get rut_conductor() { return this._data.rut_conductor; }
  get patente_taxi() { return this._data.patente_taxi; }
  get origenv() { return this._data.origenv; }
  get destinov() { return this._data.destinov; }
  get freserva() { return this._data.freserva; }
  get frealizado() { return this._data.frealizado; }
  get tipo() { return this._data.tipo; }
  get observacion() { return this._data.observacion; }
  get estados() { return this._data.estados; }
  get deletedatre() { return this._data.deletedatre; }

  // Model getters
  get conductor() { return this._data.conductor; }
  set conductor(value) { this._data.conductor = value instanceof UserModel ? value : new UserModel(value); }

  get taxi() { return this._data.taxi; }
  set taxi(value) { this._data.taxi = value instanceof TaxiModel ? value : new TaxiModel(value); }

  get historial() { return this._data.historial; }
  set historial(value) { this._data.historial = value instanceof HistorialModel ? value : new HistorialModel(value); }

  get servicio() { return this._data.servicio; }
  set servicio(value) { this._data.servicio = value instanceof ServiceModel ? value : new ServiceModel(value); }

  get viaje() { return this._data.viaje; }
  set viaje(value) { this._data.viaje = value instanceof ViajeModel ? value : new ViajeModel(value); }

  get cliente() { return this._data.cliente; }
  set cliente(value) { this._data.cliente = value instanceof UserModel ? value : new UserModel(value); }

  // Domain methods
  isActive() {
    return !this._data.deletedatre;
  }

  canBeAssigned() {
    return this._data.estados === 'EN_REVISION';
  }

  canBeCancelled() {
    return ['EN_REVISION', 'PENDIENTE'].includes(this._data.estados);
  }

  canBeStarted() {
    return this._data.estados === 'PENDIENTE' && this.hasDriver();
  }

  canBeCompleted() {
    return this._data.estados === 'EN_CAMINO';
  }

  hasDriver() {
    return !!this._data.conductor;
  }

  hasTaxi() {
    return !!this._data.taxi;
  }

  hasViaje() {
    return !!this._data.viaje;
  }

  // Model-specific methods
  isConductorAvailable() {
    return this._data.conductor?.isActive() && 
           this._data.conductor?.hasRole('CONDUCTOR');
  }

  isTaxiAvailable() {
    return this._data.taxi?.isAvailable();
  }

  getServicioTipo() {
    return this._data.servicio?.tipo;
  }

  toJSON() {
    const json = {
      codigoreserva: this._data.codigoreserva,
      idhistorial: this._data.idhistorial,
      rut_conductor: this._data.rut_conductor,
      patente_taxi: this._data.patente_taxi,
      origenv: this._data.origenv,
      destinov: this._data.destinov,
      freserva: this._data.freserva,
      frealizado: this._data.frealizado,
      tipo: this._data.tipo,
      observacion: this._data.observacion,
      estados: this._data.estados
    };

    if (this._data.conductor) {
      json.conductor = this._data.conductor.toJSON();
    }

    if (this._data.taxi) {
      json.taxi = this._data.taxi.toJSON();
    }

    if (this._data.historial) {
      json.historial = this._data.historial.toJSON();
    }

    if (this._data.servicio) {
      json.servicio = this._data.servicio.toJSON();
    }

    if (this._data.viaje) {
      json.viaje = this._data.viaje.toJSON();
    }

    if (this._data.cliente) {
      json.cliente = this._data.cliente.toJSON();
    }

    return json;
  }

  static fromDB(data) {
    if (!data) return null;
    return new ReservaModel(data);
  }
} 