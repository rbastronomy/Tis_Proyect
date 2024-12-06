import { BaseService } from "../core/BaseService.js";
import TripRepository from "../repository/TripRepository.js";

export class TripService extends BaseService {
    constructor() {     
        super();
        this.repository = new TripRepository();
    }

    /**
     * Get trip by ID
     * @param {string} code - Trip code
     * @returns {Promise<TripModel>} Trip details
     */
    async getTripById(code) {
        try {
            const trip = await this.repository.findById(code);
            if (!trip) {
                throw new Error('Trip not found');
            }
            return trip;
        } catch (error) {
            console.error('Error getting trip by id:', error);
            throw new Error('Failed to retrieve trip details');
        }
    }

    /**
     * Create a new trip
     * @param {Object} tripData - Trip data
     * @returns {Promise<TripModel>} Created trip
     */
    async createTrip(tripData) {
        try {
            this.validateTripData(tripData);
            return await this.repository.create(tripData);
        } catch (error) {
            console.error('Error creating trip:', error);
            throw new Error('Failed to create trip');
        }
    }

    /**
     * Mark a trip as completed
     * @param {string} code - Trip code
     * @param {Object} tripData - Trip update data
     * @returns {Promise<TripModel>} Updated trip
     */
    async completeTrip(code, tripData) {
        try {
            return await this.repository.update(code, {
                ...tripData,
                status: 'completed',
            });
        } catch (error) {
            console.error('Error completing trip:', error);
            throw new Error('Failed to complete trip');
        }
    }

    /**
     * Cancel a trip
     * @param {string} code - Trip code
     * @returns {Promise<TripModel>} Updated trip
     */
    async cancelTrip(code) {
        try {
            const trip = await this.repository.findById(code);
            if (!trip) {
                throw new Error('Trip not found');
            }
            return await this.repository.update(code, {
                status: 'cancelled',
            });
        } catch (error) {
            console.error('Error cancelling trip:', error);
            throw new Error('Failed to cancel trip');
        }
    }

    /**
     * Validate trip data
     * @param {Object} tripData - Trip data to validate
     * @throws {Error} If required fields are missing
     */
    validateTripData(tripData) {
        const requiredFields = ['origin', 'destination', 'passengers'];
        for (const field of requiredFields) {
            if (!(field in tripData)) {
                throw new Error(`Field ${field} is required`);
            }
        }
    }

    /**
     * Get trips by driver
     * @param {string} driverId - Driver's ID
     * @returns {Promise<Array<TripModel>>} List of trips
     */
    async getTripsByDriver(driverId) {
        try {
            return await this.repository.findByDriver(driverId);
        } catch (error) {
            console.error('Error getting trips by driver:', error);
            throw new Error('Failed to retrieve trips for the driver');
        }
    }

    /**
     * Get trips within a date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<Array<TripModel>>} List of trips
     */
    async getTripsByDateRange(startDate, endDate) {
        try {
            if (startDate > endDate) {
                throw new Error('Start date must be before or equal to end date');
            }
            return await this.repository.findByDateRange(startDate, endDate);
        } catch (error) {
            console.error('Error getting trips by date range:', error);
            throw new Error('Failed to retrieve trips for the specified date range');
        }
    }

    /**
     * Get detailed trip information
     * @param {string} code - Trip code
     * @returns {Promise<TripModel>} Trip details
     */
    async getTripDetails(code) {
        try {
            const trip = await this.repository.findWithDetails(code);
            if (!trip) {
                throw new Error('Trip not found');
            }
            return trip;
        } catch (error) {
            console.error('Error getting trip details:', error);
            throw new Error('Failed to retrieve trip details');
        }
    }

    /**
     * Get trips by reservation
     * @param {string} reservationCode - Reservation code
     * @returns {Promise<Array<TripModel>>} List of trips
     */
    async getTripsByReservation(reservationCode) {
        try {
            return await this.repository.findByReservation(reservationCode);
        } catch (error) {
            console.error('Error getting trips by reservation:', error);
            throw new Error('Failed to retrieve trips for the reservation');
        }
    }

    /**
     * Update trip
     * @param {string} code - Trip code
     * @param {Object} tripData - Trip update data
     * @returns {Promise<TripModel>} Updated trip
     */
    async updateTrip(code, tripData) {
        try {
            const updatedTrip = await this.repository.update(code, tripData);
            return updatedTrip;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete trip (soft delete)
     * @param {string} code - Trip code
     * @returns {Promise<TripModel>} Deleted trip
     */
    async deleteTrip(code) {
        try {
            const deletedTrip = await this.repository.softDelete(code);
            if (!deletedTrip) {
                throw new Error('Trip not found');
            }
            return deletedTrip;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all trips
     * @param {Object} query - Query parameters
     * @returns {Promise<Array<TripModel>>} List of trips
     */
    async getAll(query) {
        try {
            const trips = await this.repository.getAll(query);
            return trips;
        } catch (error) {
            throw error;
        }
    }
}

export default TripService;