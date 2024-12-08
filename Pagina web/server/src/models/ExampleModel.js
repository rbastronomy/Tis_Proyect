import { BaseModel } from '../core/BaseModel.js';

export class ExampleModel extends BaseModel {
  constructor(data = {}) {
    super();
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.status = data.status || 'active';
    this.description = data.description || '';
  }

  /**
   * Convierte los datos de la base de datos al modelo
   * @param {Object} data - Datos crudos de la base de datos
   * @returns {ExampleModel} Instancia del modelo
   */
  static fromDB(data) {
    return new ExampleModel({
      id: data.id,
      name: data.name,
      email: data.email,
      status: data.status,
      description: data.description
    });
  }

  /**
   * Convierte el modelo a un objeto plano para la base de datos
   * @returns {Object} Objeto plano para la base de datos
   */
  toDB() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      status: this.status,
      description: this.description
    };
  }

  // Métodos específicos del modelo
  isActive() {
    return this.status === 'Active';
  }

  getDisplayName() {
    return `${this.name} (${this.email})`;
  }

  // Validaciones
  validate() {
    if (!this.name) throw new Error('Name is required');
    if (!this.email) throw new Error('Email is required');
    if (!this.status) throw new Error('Status is required');
    return true;
  }
} 