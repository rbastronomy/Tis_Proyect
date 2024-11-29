export class BaseModel {
  /**
   * @param {Object} data - Initial data for the model
   * @param {Object} defaultData - Default values for the model
   */
  constructor(data = {}, defaultData = {}) {
    // Initialize with defaults, then override with provided data
    this._data = {
      ...defaultData,
      ...data
    };

    // Freeze the structure of _data to prevent accidental property additions
    Object.seal(this._data);
  }

  /**
   * Converts the model to a plain JSON object
   * @returns {Object}
   */
  toJSON() {
    return { ...this._data };
  }

  /**
   * Updates model properties
   * @param {Object} data - New data to update
   */
  update(data) {
    Object.assign(this._data, data);
  }

  /**
   * Gets properties that have been modified
   * @param {Object} newData - New data to compare
   * @returns {Object}
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
}