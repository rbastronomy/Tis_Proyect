import { BaseModel } from '../core/BaseModel.js';

export class ViajeModel extends BaseModel {
  static defaultData = {
    codigoviaje: null,
    codigoreserva: null,
    codigoboleta: null,
    duracionv: 0,
    observacionv: '',
    fechav: null,
    // Related data
    origenv: null,
    destinov: null,
    tipo: null,
    reserva_observacion: null,
    conductor_nombre: null,
    conductor_apellido: null,
    taxi_modelo: null,
    taxi_ano: null,
    patente: null
  };

  constructor(data = {}) {
    super(data, ViajeModel.defaultData);
  }

  // Getters
  get codigoviaje() { return this._data.codigoviaje; }
  get codigoreserva() { return this._data.codigoreserva; }
  get duracionv() { return this._data.duracionv; }
  get observacionv() { return this._data.observacionv; }
  get fechav() { return this._data.fechav; }

  // Domain methods
  getDuracionEnHoras() {
    return this._data.duracionv / 60;
  }

  hasReservaInfo() {
    return !!this._data.origenv;
  }

  hasConductorInfo() {
    return !!this._data.conductor_nombre;
  }

  hasTaxiInfo() {
    return !!this._data.taxi_modelo;
  }

  associateReserva(reservaModel) {
    this._datacodigoreserva = reservaModel.codigoreserva;
    this._data.origenv = reservaModel.origen;
    this._data.destinov = reservaModel.destino;
    this._data.tipo = reservaModel.tipo;
    this._data.reserva_observacion = reservaModel.observacion;
  }

  associateBoleta (BoletaModel){
    this._data.codigoboleta = BoletaModel.codigoboleta;
  }

  generateRelationship(){
    return{
      codigo: this._data.codigoviaje,
      codigoreserva: this._data.codigoreserva,
      codigoboleta: this._data.codigoboleta,
      fechagenerada: new Date()
    }
  }

  toJSON() {
    const json = {
      codigoviaje: this._data.codigoviaje,
      codigoreserva: this._data.codigoreserva,
      codigoboleta: this._data.codigoboleta,
      duracionv: this._data.duracionv,
      observacionv: this._data.observacionv,
      fechav: this._data.fechav,
      fechagenerada: this._data.fechagenerada
    };

    if (this.hasReservaInfo()) {
      json.reserva = {
        origen: this._data.origenv,
        destino: this._data.destinov,
        tipo: this._data.tipo,
        observacion: this._data.reserva_observacion
      };
    }

    if (this.hasConductorInfo()) {
      json.conductor = {
        nombre: this._data.conductor_nombre,
        apellido: this._data.conductor_apellido
      };
    }

    if (this.hasTaxiInfo()) {
      json.taxi = {
        modelo: this._data.taxi_modelo,
        ano: this._data.taxi_ano,
        patente: this._data.patente
      };
    }

    return json;
  }

  static fromDB(data) {
    if (!data) return null;
    return new ViajeModel(data);
  }
} 