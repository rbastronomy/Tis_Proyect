import { BaseModel } from '../core/BaseModel.js';
import { GeolocalizationModel } from './GeolocalizationModel.js';
import { UserModel } from './UserModel.js';

/**
 * Represents the internal data structure of TaxiModel
 * @typedef {Object} TaxiModelData
 * @property {string|null} patente - License plate (primary key)
 * @property {number|null} rut_conductor - Driver's RUT
 * @property {string} marca - Car brand
 * @property {string} modelo - Car model
 * @property {string} color - Car color
 * @property {number|null} ano - Car year
 * @property {Date|null} vencimiento_revision_tecnica - Technical inspection expiration date
 * @property {Date|null} vencimiento_permiso_circulacion - Circulation permit expiration date
 * @property {number|null} codigo_taxi - Unique taxi code
 * @property {string} estado_taxi - Taxi status
 * @property {Date|null} deleted_at_taxi - Soft delete timestamp
 * @property {Date|null} created_at - Creation timestamp
 * @property {Date|null} updated_at - Last update timestamp
 * @property {UserModel|null} conductor - Associated driver
 * @property {GeolocalizationModel|null} geolocalizacion - Current location
 */

/**
 * Class representing a Taxi in the system
 * @extends {BaseModel<TaxiModelData>}
 */
export class TaxiModel extends BaseModel {
  static VALID_ESTADOS = ['DISPONIBLE', 'EN SERVICIO', 'FUERA DE SERVICIO', 'MANTENIMIENTO'];

  /**
   * Default values for a new taxi instance
   * @type {TaxiModelData}
   */
  static defaultData = {
    patente: null,
    rut_conductor: null,
    marca: '',
    modelo: '',
    color: '',
    ano: null,
    vencimiento_revision_tecnica: null,
    vencimiento_permiso_circulacion: null,
    codigo_taxi: null,
    estado_taxi: 'DISPONIBLE',
    deleted_at_taxi: null,
    created_at: null,
    updated_at: null,
    conductor: null,
    geolocalizacion: null
  };
  
  /**
   * Creates a new TaxiModel instance
   * @param {Partial<TaxiModelData>} data - Initial taxi data
   * @throws {Error} If validation fails
   */
  constructor(data = {}) {
    console.log('TaxiModel - Constructor received data:', data);
    
    super(data, TaxiModel.defaultData);
    this.validate();
    
    if (data.conductor) {
        console.log('TaxiModel - Processing conductor data:', data.conductor);
        this._data.conductor = data.conductor instanceof UserModel ? 
            data.conductor : 
            new UserModel({
                ...data.conductor,
                role: { nombre_rol: 'CONDUCTOR' }
            });
        this._data.rut_conductor = this._data.conductor.rut;
        console.log('TaxiModel - Processed conductor:', this._data.conductor.toJSON());
    }
    if (data.geolocalizacion) {
        this.geolocalizacion = new GeolocalizationModel(data.geolocalizacion);
    }
    
    console.log('TaxiModel - Constructor finished, data:', this._data);
  }

  /**
   * Validates the taxi data
   * @private
   * @throws {Error} If validation fails
   */
  validate() {
    // Bind the validation methods to this instance
    const validate = {
      string: this.validateString.bind(this),
      number: this.validateNumber.bind(this),
      date: this.validateDate.bind(this),
      enum: this.validateEnum.bind(this)
    };

    this.clearErrors();

    validate.string('patente', this._data.patente);
    validate.string('marca', this._data.marca);
    validate.string('modelo', this._data.modelo);
    validate.string('color', this._data.color);
    validate.number('ano', this._data.ano, { min: 1900, max: new Date().getFullYear() + 1 });
    validate.enum('estado_taxi', this._data.estado_taxi, TaxiModel.VALID_ESTADOS);
    if (this._data.vencimiento_revision_tecnica) {
        validate.date('vencimiento_revision_tecnica', this._data.vencimiento_revision_tecnica);
    }
    if (this._data.vencimiento_permiso_circulacion) {
        validate.date('vencimiento_permiso_circulacion', this._data.vencimiento_permiso_circulacion);
    }

    this.throwIfErrors();
  }

  // Setters with validation
  /** @param {string} value */
  set patente(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('Patente debe ser una cadena válida');
    }
    this._data.patente = value.trim().toUpperCase();
  }

  /** @param {string} value */
  set estado_taxi(value) {
    if (!TaxiModel.VALID_ESTADOS.includes(value)) {
      throw new Error(`Estado debe ser uno de: ${TaxiModel.VALID_ESTADOS.join(', ')}`);
    }
    this._data.estado_taxi = value;
  }

  /** @param {UserModel|Object} value */
  set conductor(value) {
    this._data.conductor = value instanceof UserModel ? value : new UserModel(value);
    if (!this._data.conductor.isDriver()) {
      throw new Error('El conductor asignado debe tener rol de conductor');
    }
    this._data.rut_conductor = this._data.conductor.rut;
  }

  // Getters
  /** @returns {string} License plate */
  get patente() { return this._data.patente; }
  /** @returns {string} Car brand */
  get marca() { return this._data.marca; }
  /** @returns {string} Car model */
  get modelo() { return this._data.modelo; }
  /** @returns {string} Car color */
  get color() { return this._data.color; }
  /** @returns {number} Car year */
  get ano() { return this._data.ano; }
  /** @returns {number} Taxi code */
  get codigo_taxi() { return this._data.codigo_taxi; }
  /** @returns {string} Taxi status */
  get estado_taxi() { return this._data.estado_taxi; }
  /** @returns {Date} Technical inspection expiration */
  get vencimiento_revision_tecnica() { return this._data.vencimiento_revision_tecnica; }
  /** @returns {Date} Circulation permit expiration */
  get vencimiento_permiso_circulacion() { return this._data.vencimiento_permiso_circulacion; }
  /** @returns {UserModel} Associated driver */
  get conductor() { return this._data.conductor; }
  /** @returns {GeolocalizationModel} Current location */
  get geolocalizacion() { return this._data.geolocalizacion; }

  // Status check methods
  /** @returns {boolean} */
  isAvailable() { return this._data.estado_taxi === 'DISPONIBLE'; }
  /** @returns {boolean} */
  isFueraDeServicio() { return this._data.estado_taxi === 'FUERA DE SERVICIO'; }
  /** @returns {boolean} */
  isEnServicio() { return this._data.estado_taxi === 'EN SERVICIO'; }
  /** @returns {boolean} */
  isMantenimiento() { return this._data.estado_taxi === 'MANTENIMIENTO'; }

  /**
   * Converts the taxi model to a JSON object
   * @returns {Object} Taxi data as JSON
   */
  toJSON() {
    console.log('TaxiModel - Converting to JSON, current data:', this._data);
    
    const json = {
        patente: this._data.patente,
        rut_conductor: this._data.rut_conductor,
        marca: this._data.marca,
        modelo: this._data.modelo,
        color: this._data.color,
        ano: this._data.ano,
        vencimiento_revision_tecnica: this._data.vencimiento_revision_tecnica,
        vencimiento_permiso_circulacion: this._data.vencimiento_permiso_circulacion,
        codigo_taxi: this._data.codigo_taxi,
        estado_taxi: this._data.estado_taxi,
        deleted_at_taxi: this._data.deleted_at_taxi,
        created_at: this._data.created_at,
        updated_at: this._data.updated_at
    };

    if (this._data.conductor) {
        console.log('TaxiModel - Including conductor in JSON:', this._data.conductor);
        json.conductor = this._data.conductor.toJSON();
    }
    if (this._data.geolocalizacion) {
        json.geolocalizacion = this._data.geolocalizacion.toJSON();
    }

    console.log('TaxiModel - Final JSON:', json);
    return json;
  }

  /**
   * Creates a TaxiModel instance from database data
   * @param {Object} data - Raw database data
   * @returns {TaxiModel|null} New TaxiModel instance or null
   */
  static fromDB(data) {
    if (!data) return null;
    return new TaxiModel(data);
  }
}