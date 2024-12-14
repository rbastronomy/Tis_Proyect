/**
 * Base model class that all models extend from
 * @template T
 */
export class BaseModel {
  /**
   * @protected
   * @type {T}
   */
  _data;

  /**
   * @protected
   * @type {Object}
   */
  _errors = {};

  /**
   * @param {Partial<T>} data - Initial data
   * @param {T} defaultData - Default values for the model
   */
  constructor(data = {}, defaultData = {}) {
    // Initialize with defaults, then override with provided data
    this._data = { ...defaultData, ...data };
    
    // Freeze the structure of _data to prevent accidental property additions
    Object.seal(this._data);

    // Run validation if the model implements it
    if (this.validate) {
      this.validate();
    }
  }

  /**
   * Adds a validation error
   * @protected
   * @param {string} field - The field that failed validation
   * @param {string} message - The error message
   */
  addError(field, message) {
    this._errors[field] = message;
  }

  /**
   * Checks if the model has validation errors
   * @returns {boolean} True if there are validation errors
   */
  hasErrors() {
    return Object.keys(this._errors).length > 0;
  }

  /**
   * Gets all validation errors
   * @returns {Object} Validation errors
   */
  getErrors() {
    return this._errors;
  }

  /**
   * Clears all validation errors
   */
  clearErrors() {
    this._errors = {};
  }

  /**
   * Throws an error if validation fails
   * @protected
   * @throws {Error} If there are validation errors
   */
  throwIfErrors() {
    if (this.hasErrors()) {
      throw new Error(Object.values(this._errors).join('; '));
    }
  }

  /**
   * Validates a string field
   * @param {string} field - Field name
   * @param {string} value - Value to validate
   * @param {Object} options - Validation options
   */
  validateString(field, value, options = {}) {
    const { required = true, minLength = 0, maxLength = undefined } = options;
    
    // If field is not required and value is empty, skip validation
    if (!required && (value === null || value === undefined || value === '')) {
      return;
    }

    // For required fields or when value is present
    if (required && (value === null || value === undefined || value === '')) {
      this._errors[field] = `${field} es requerido y debe ser texto`;
      return;
    }

    // If we get here, we have a value to validate
    if (typeof value !== 'string') {
      this._errors[field] = `${field} debe ser texto`;
      return;
    }

    const trimmedValue = value.trim();
    
    if (minLength && trimmedValue.length < minLength) {
      this._errors[field] = `${field} debe tener al menos ${minLength} caracteres`;
    }
    
    if (maxLength && trimmedValue.length > maxLength) {
      this._errors[field] = `${field} no puede tener más de ${maxLength} caracteres`;
    }
  }

  /**
   * Validates a number field
   * @param {string} field - Field name
   * @param {number} value - Value to validate
   * @param {Object} options - Validation options
   */
  validateNumber(field, value, options = {}) {
    const { required = true, min = undefined, max = undefined } = options;
    
    if (required && (value === null || value === undefined || isNaN(value))) {
      this._errors[field] = `${field} es requerido y debe ser un número`;
      return;
    }

    if (value !== null && value !== undefined) {
      const numValue = Number(value);
      if (min !== undefined && numValue < min) {
        this._errors[field] = `${field} debe ser mayor o igual a ${min}`;
      }
      if (max !== undefined && numValue > max) {
        this._errors[field] = `${field} debe ser menor o igual a ${max}`;
      }
    }
  }

  /**
   * Validates a date field
   * @param {string} field - Field name
   * @param {Date|string} value - Value to validate
   * @param {Object} options - Validation options
   */
  validateDate(field, value, options = {}) {
    const { required = true, minDate = undefined, maxDate = undefined } = options;
    
    if (required && !value) {
      this._errors[field] = `${field} es requerido`;
      return;
    }

    if (value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        this._errors[field] = `${field} debe ser una fecha válida`;
        return;
      }

      if (minDate && date < new Date(minDate)) {
        this._errors[field] = `${field} debe ser posterior a ${minDate}`;
      }
      if (maxDate && date > new Date(maxDate)) {
        this._errors[field] = `${field} debe ser anterior a ${maxDate}`;
      }
    }
  }

  /**
   * Validates an enum field
   * @param {string} field - Field name
   * @param {any} value - Value to validate
   * @param {Array} validValues - Array of valid values
   * @param {Object} options - Validation options
   */
  validateEnum(field, value, validValues, options = {}) {
    const { required = true } = options;
    
    if (required && !value) {
      this._errors[field] = `${field} es requerido`;
      return;
    }

    if (value && !validValues.includes(value)) {
      this._errors[field] = `${field} debe ser uno de: ${validValues.join(', ')}`;
    }
  }

  /**
   * Creates a model instance from data
   * @template {BaseModel} M
   * @param {Object} data - Data object
   * @returns {M|null} - Returns null if data is null/undefined or validation fails
   */
  static toModel(data) {
    if (!data) return null;
    try {
      return new this(data);
    } catch (error) {
      console.error('Model creation failed:', error.message);
      return null;
    }
  }

  /**
   * Creates an array of model instances from data objects
   * @template {BaseModel} M
   * @param {Object[]} dataArray - Array of data objects
   * @returns {M[]} - Array of model instances
   */
  static toModels(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => this.toModel(data)).filter(Boolean);
  }

  /**
   * Converts the model to a plain JSON object
   * @returns {Partial<T>}
   */
  toJSON() {
    return { ...this._data };
  }

  /**
   * Updates model properties
   * @param {Partial<T>} data - New data to update
   * @throws {Error} If validation fails
   */
  update(data) {
    Object.assign(this._data, data);
    if (this.validate) {
      this.validate();
    }
  }

  /**
   * Gets properties that have been modified
   * @param {Partial<T>} newData - New data to compare
   * @returns {Partial<T>} Object containing only the modified properties
   */
  getDirtyProperties(newData) {
    const dirtyProps = {};
    Object.keys(newData).forEach(key => {
      if (this._data[key] !== newData[key]) {
        dirtyProps[key] = newData[key];
      }
    });
    return dirtyProps;
  }

  /**
   * Gets the value of a property
   * @template {keyof T} K
   * @param {K} prop - Property name
   * @returns {T[K]} Property value
   */
  get(prop) {
    return this._data[prop];
  }

  /**
   * Sets the value of a property
   * @template {keyof T} K
   * @param {K} prop - Property name
   * @param {T[K]} value - New value
   */
  set(prop, value) {
    this._data[prop] = value;
  }
}
