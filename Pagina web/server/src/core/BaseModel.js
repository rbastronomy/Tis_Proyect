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
   * @param {Partial<T>} data - Initial data
   * @param {T} defaultData - Default values for the model
   */
  constructor(data, defaultData) {
    // Initialize with defaults, then override with provided data
    this._data = { ...defaultData, ...data };
    
    // Freeze the structure of _data to prevent accidental property additions
    Object.seal(this._data);
  }

  /**
   * Creates a model instance from data
   * @template {BaseModel} M
   * @param {Object} data - Data object
   * @returns {M|null} - Returns null if data is null/undefined
   */
  static toModel(data) {
    if (!data) return null;
    return new this(data); // Create a new instance of the model with the provided data
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
   */
  update(data) {
    Object.assign(this._data, data);
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
   * Checks if the model has all required properties
   * @param {(keyof T)[]} requiredProps - Array of required property names
   * @returns {boolean} True if all required properties are present and not null/undefined
   */
  hasRequiredProperties(requiredProps) {
    return requiredProps.every(prop => 
      this._data[prop] != null && this._data[prop] !== ''
    );
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
