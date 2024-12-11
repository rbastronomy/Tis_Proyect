import { BaseModel } from "../core/BaseModel.js";
import { UserModel } from './UserModel.js';

/**
 * Represents the internal data structure of SessionModel
 * @typedef {Object} SessionModelData
 * @property {string} id - Session unique identifier
 * @property {string} user_id - Associated user ID
 * @property {Date} expires_at - Session expiration timestamp
 * @property {Date|null} created_at - Creation timestamp
 * @property {Date|null} updated_at - Last update timestamp
 * @property {UserModel|null} user - Associated user
 */

/**
 * Class representing a Session in the system
 * @extends {BaseModel<SessionModelData>}
 */
export class SessionModel extends BaseModel {
    /**
     * Default values for a new session instance
     * @type {SessionModelData}
     */
    static defaultData = {
        id: null,
        user_id: null,
        expires_at: null,
        created_at: null,
        updated_at: null,
        user: null
    };

    /**
     * Creates a new SessionModel instance
     * @param {Partial<SessionModelData>} data - Initial session data
     * @throws {Error} If validation fails
     */
    constructor(data = {}) {
        super(data, SessionModel.defaultData);
        this.validate();
        
        // Initialize related user model if raw data is provided
        if (data.user) {
            this.user = data.user;
        }
    }

    /**
     * Validates the session data
     * @private
     * @throws {Error} If validation fails
     */
    validate() {
        this.clearErrors();

        if (!this._data.id) {
            this.addError('id', 'Session ID is required');
        }

        if (!this._data.user_id) {
            this.addError('user_id', 'User ID is required');
        }

        if (!this._data.expires_at) {
            this.addError('expires_at', 'Expiration date is required');
        }

        this.validateDate('expires_at', this._data.expires_at);

        this.throwIfErrors();
    }

    // Setters with validation
    /** @param {string} value */
    set id(value) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Session ID must be a valid string');
        }
        this._data.id = value.trim();
    }

    /** @param {string} value */
    set user_id(value) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('User ID must be a valid string');
        }
        this._data.user_id = value.trim();
    }

    /** @param {Date|string} value */
    set expires_at(value) {
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Expiration date must be a valid date');
        }
        this._data.expires_at = date;
    }

    /** @param {UserModel|Object} value */
    set user(value) {
        this._data.user = value instanceof UserModel ? value : new UserModel(value);
    }

    // Getters
    /** @returns {string} Session ID */
    get id() { return this._data.id; }
    /** @returns {string} User ID */
    get user_id() { return this._data.user_id; }
    /** @returns {Date} Expiration date */
    get expires_at() { return this._data.expires_at; }
    /** @returns {UserModel} Associated user */
    get user() { return this._data.user; }

    /**
     * Checks if the session is expired
     * @returns {boolean} True if session is expired
     */
    isExpired() {
        return Date.now() >= this.expires_at.getTime();
    }

    /**
     * Checks if the session needs to be extended
     * @returns {boolean} True if session needs extension
     */
    needsExtension() {
        const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
        return Date.now() >= this.expires_at.getTime() - fifteenDaysInMs;
    }

    /**
     * Converts the session model to a JSON object
     * @returns {Object} Session data as JSON
     */
    toJSON() {
        const json = {
            id: this._data.id,
            user_id: this._data.user_id,
            expires_at: this._data.expires_at,
            created_at: this._data.created_at,
            updated_at: this._data.updated_at,
        };

        if (this._data.user) {
            json.user = this._data.user.toJSON();
        }

        return json;
    }
} 