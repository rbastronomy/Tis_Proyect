import { BaseService } from "../core/BaseService.js";
import { RatingModel } from "../models/RatingModel.js";
import { RatingRepository } from "../repository/RatingRepository.js";

export class RatingService extends BaseService {
    constructor() {
        super();
        this.repository = new RatingRepository();
    }

    /**
     * Get rating by ID
     * @param {string} id_valoracion} - Rating ID
     * @returns {Promise<RatingModel>} Rating details
     */
    async getRatingById(id_valoracion) {
        try {
            const rating = await this.repository.findById(id_valoracion);
            if (!rating) {
                throw new Error('Rating not found');
            }
            return rating;
        } catch (error) {
            console.error('Error getting rating by id_valoracion:', error);
            throw new Error('Failed to retrieve rating details');
        }
    }

    async getRatingForTrip(codigo_viaje) {
        try {
            const ratings = await this.repository.findByTrip(codigo_viaje);
            return ratings;
        } catch (error) {
            console.error('Error getting ratings for trip:', error);
            throw new Error('Failed to retrieve ratings');
        }
    }

    async getRatingForUser(rut){
        try {
            const ratings = await this.repository.findByUser(rut);
            return ratings;
        } catch (error) {
            console.error('Error getting ratings for user:', error);
            throw new Error('Failed to retrieve ratings');
        }
    }

    /**
     * Create a new rating
     * @param {Object} ratingData - Rating data
     * @returns {Promise<RatingModel>} Created rating
     */
    async createRating(ratingData) {
        try {
            this.validateRatingData(ratingData);
            return await this.repository.create(ratingData);
        } catch (error) {
            console.error('Error creating rating:', error);
            throw new Error('Failed to create rating');
        }
    }

    async deleteRating(id_valoracion) {
        try {
            return await this.repository.softDelete(id_valoracion);
        } catch (error) {
            console.error('Error deleting rating:', error);
            throw new Error('Failed to delete rating');
        }
    }
    /*//revisar
    async createRating(ratingData) {
        try {
            this.validateRatingData(ratingData);
            return await this.repository.create(ratingData);
        } catch (error) {
            console.error('Error creating rating:', error);
            throw new Error('Failed to create rating');
        }
    }
    */

    async findAll() {
        try {
            return await this.repository.findAll();
        } catch (error) {
            console.error('Error getting all ratings:', error);
            throw new Error('Failed to retrieve ratings');
        }
    }

    /**
     * Update rating data
     * @param {string} id_valoracion - Rating ID
     * @param {Object} ratingData - Updated rating data
     * @returns {Promise<RatingModel>} Updated rating
     */
    async updateRating(id_valoracion, ratingData) {
        try {
            return await this.repository.update(id_valoracion, ratingData);
        } catch (error) {
            console.error('Error updating rating:', error);
            throw new Error('Failed to update rating');
        }
    }

    validateRatingData(ratingData) {
        const requieredFields = ['comentario_valoracion', 'calificacion'];
        for (const field of requieredFields) {
            if (!ratingData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }
}