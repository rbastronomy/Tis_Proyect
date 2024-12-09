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
   * @type {Array<{field: string, message: string}>}
   */
  _errors = [];

  /**
   * @param {Partial<T>} data - Initial data
   * @param {T} defaultData - Default values for the model
   */
  constructor(data, defaultData) {
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
    this._errors.push({ field, message });
  }

  /**
   * Checks if the model has validation errors
   * @returns {boolean} True if there are validation errors
   */
  hasErrors() {
    return this._errors.length > 0;
  }

  /**
   * Gets all validation errors
   * @returns {Array<{field: string, message: string}>} Array of validation errors
   */
  getErrors() {
    return [...this._errors];
  }

  /**
   * Clears all validation errors
   */
  clearErrors() {
    this._errors = [];
  }

  /**
   * Throws an error if validation fails
   * @protected
   * @throws {Error} If there are validation errors
   */
  throwIfErrors() {
    if (this.hasErrors()) {
      throw new Error(
        this._errors
          .map(e => `${e.field}: ${e.message}`)
          .join(', ')
      );
    }
  }

  /**
   * Validates a value against an array of valid options
   * @protected
   * @param {string} field - The field name
   * @param {any} value - The value to validate
   * @param {any[]} validOptions - Array of valid options
   * @param {string} [message] - Custom error message
   * @returns {boolean} True if validation passes
   */
  validateEnum(field, value, validOptions, message) {
    if (value && !validOptions.includes(value)) {
      this.addError(field, message || `${field} must be one of: ${validOptions.join(', ')}`);
      return false;
    }
    return true;
  }

  /**
   * Validates that a value is a string and not empty
   * @protected
   * @param {string} field - The field name
   * @param {any} value - The value to validate
   * @param {string} [message] - Custom error message
   * @returns {boolean} True if validation passes
   */
  validateString(field, value, message) {
    if (value && (typeof value !== 'string' || value.trim().length === 0)) {
      this.addError(field, message || `${field} must be a non-empty string`);
      return false;
    }
    return true;
  }

  /**
   * Validates that a value is a valid date
   * @protected
   * @param {string} field - The field name
   * @param {any} value - The value to validate
   * @param {string} [message] - Custom error message
   * @returns {boolean} True if validation passes
   */
  validateDate(field, value, message) {
    if (value && !(value instanceof Date) && isNaN(new Date(value).getTime())) {
      this.addError(field, message || `${field} must be a valid date`);
      return false;
    }
    return true;
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
