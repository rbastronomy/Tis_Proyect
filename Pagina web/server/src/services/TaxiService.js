import { BaseService } from "../core/BaseService.js"
import { TaxiRepository } from "../repository/TaxiRepository.js";
import { TaxiModel } from '../models/TaxiModel.js';
import { UserService } from './UserService.js';

export class TaxiService extends BaseService {
    constructor() {
        const taxiRepository = new TaxiRepository();
        super(taxiRepository);
        this.userService = new UserService();
    }

    /**
     * Creates a new taxi
     * @param {Object} taxiData - Raw taxi data
     * @returns {Promise<TaxiModel>} Created taxi model
     * @throws {Error} If creation fails
     */
    async createTaxi(taxiData) {
        try {
            // Create model instance (validation happens in constructor)
            const taxiModel = new TaxiModel(taxiData);
            
            // Save raw data to database
            const createdTaxi = await this.repository.create(taxiModel.toJSON());
            
            // Return as model instance
            return new TaxiModel(createdTaxi);
        } catch (error) {
            throw new Error(`Error creating taxi: ${error.message}`);
        }
    }

    /**
     * Updates a taxi
     * @param {string} patente - License plate
     * @param {Object} taxiData - Updated taxi data
     * @returns {Promise<TaxiModel>} Updated taxi model
     * @throws {Error} If update fails
     */
    async updateTaxi(patente, taxiData) {
        try {
            // Get existing taxi
            const existingTaxi = await this.repository.findByPatente(patente);
            if (!existingTaxi) {
                throw new Error('Taxi not found');
            }

            // Create model with merged data (validation happens in constructor)
            const taxiModel = new TaxiModel({
                ...existingTaxi,
                ...taxiData
            });

            // Save to database
            const updatedTaxi = await this.repository.update(patente, taxiModel.toJSON());
            
            return new TaxiModel(updatedTaxi);
        } catch (error) {
            throw new Error(`Error updating taxi: ${error.message}`);
        }
    }

    /**
     * Soft deletes a taxi
     * @param {string} patente - License plate
     * @returns {Promise<TaxiModel>} Deleted taxi model
     * @throws {Error} If deletion fails
     */
    async deleteTaxi(patente) {
        try {
            const deletedTaxi = await this.repository.softDelete(patente);
            if (!deletedTaxi) {
                throw new Error('Taxi not found');
            }
            return new TaxiModel(deletedTaxi);
        } catch (error) {
            throw new Error(`Error deleting taxi: ${error.message}`);
        }
    }

    /**
     * Gets a taxi by license plate
     * @param {string} patente - License plate
     * @returns {Promise<TaxiModel>} Taxi model
     * @throws {Error} If taxi not found
     */
    async getTaxiByLicensePlate(patente) {
        try {
            const taxi = await this.repository.findByPatente(patente);
            if (!taxi) {
                throw new Error('Taxi not found');
            }
            return new TaxiModel(taxi);
        } catch (error) {
            throw new Error(`Error fetching taxi: ${error.message}`);
        }
    }

    /**
     * Checks technical review status
     * @param {string} patente - License plate
     * @returns {Promise<boolean>} True if review is current
     * @throws {Error} If check fails
     */
    async checkTechnicalReview(patente) {
        try {
            const taxi = await this.getTaxiByLicensePlate(patente);
            const currentDate = new Date();
            const reviewDate = new Date(taxi.vencimiento_revision_tecnica);
            return reviewDate >= currentDate;
        } catch (error) {
            throw new Error(`Error checking technical review: ${error.message}`);
        }
    }

    /**
     * Gets all taxis
     * @param {Object} query - Query parameters
     * @returns {Promise<TaxiModel[]>} Array of taxi models
     * @throws {Error} If fetch fails
     */
    async getAll(query = {}) {
        try {
            const taxis = await this.repository.getAll(query);
            return taxis.map(taxi => new TaxiModel(taxi));
        } catch (error) {
            throw new Error(`Error fetching taxis: ${error.message}`);
        }
    }
}