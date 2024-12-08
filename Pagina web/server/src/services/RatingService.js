import { BaseService } from "../core/BaseService.js";
import { RatingModel } from "../models/RatingModel.js";
import { RatingRepository } from "../repository/RatingRepository.js";
import { TripRepository } from "../repository/TripRepository.js";
import { UserRepository } from "../repository/UserRepository.js";

export class RatingService extends BaseService {
    constructor() {
        const ratingRepository = new RatingRepository();
        super(ratingRepository);
        this.tripRepository = new TripRepository();
        this.userRepository = new UserRepository();
    }

    /**
     * Get rating by ID
     * @param {string} id_valoracion} - Rating ID
     * @returns {Promise<RatingModel>} Rating details
     */
    async getRatingById(id_valoracion) {
        try {
            const rating = await this.ratingRepository.findById(id_valoracion);
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
            const ratings = await this.tripRepository.findByTrip(codigo_viaje);
            return ratings;
        } catch (error) {
            console.error('Error getting ratings for trip:', error);
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
}