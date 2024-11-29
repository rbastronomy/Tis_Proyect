import { BaseService } from "../core/BaseService";
import TripRepository from "../repository/TripRepository";
import { TripModel } from "../models/TripModel";

export class TripService extends BaseService {
    constructor() {     
        super();
        this.repository = new TripRepository();
    }

    async createTrip(tripData) {
        try {
            const createdTrip = await this.repository.create(tripData);
            return createdTrip;
        } catch (error) {
            throw error;
        }
    }

    async updateTrip(codigo, tripData) {
        try {
            const updatedTrip = await this.repository.update(codigo, tripData);
            return updatedTrip;
        } catch (error) {
            throw error;
        }
    }

    async deleteTrip(codigo) {
        try {
            const deletedTrip = await this.repository.softDelete(codigo);
            if (!deletedTrip) {
                throw new Error('Trip not found');
            }
            return deletedTrip;
        } catch (error) {
            throw error;
        }
    }

    async getTrip(codigo) {
        try {
            const trip = await this.repository.get(codigo);
            if (!trip) {
                throw new Error('Trip not found');
            }
            return trip;
        } catch (error) {
            throw error;
        }
    }

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