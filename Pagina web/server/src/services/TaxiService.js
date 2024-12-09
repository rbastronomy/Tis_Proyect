import { BaseService } from "../core/BaseService.js"
import { TaxiRepository } from "../repository/TaxiRepository.js";

export class TaxiService extends BaseService {
    constructor() {
        super();
        this.repository = new TaxiRepository();
    }

    async createTaxi(taxiData) {
        try {
            const createdTaxi = await this.repository.create(taxiData);
            return createdTaxi;
        } catch (error) {
            throw error;
        }
    }

    async updateTaxi(patente, taxiData) {
        try {
            const updatedTaxi = await this.repository.update(patente, taxiData);
            return updatedTaxi;
        } catch (error) {
            throw error;
        }
    }

    async deleteTaxi(patente) {
        try {
            const deletedTaxi = await this.repository.softDelete(patente);
            if (!deletedTaxi) {
                throw new Error('Taxi encontrado');
            }
            return deletedTaxi;
        } catch (error) {
            throw error;
        }
    }

    async getTaxiByLicensePlate(patente) {
        try {
            const taxi = await this.repository.findByPatente(patente);
            if (!taxi) {
                throw new Error('Taxi encontrado');
            }
            return taxi;
        } catch (error) {
            throw error;
        }
    }

    async checkTechnicalReview(patente) {
        try {
            const taxi = await this.repository.findByPatente(patente);
            if (!taxi) {
                throw new Error('Taxi no encontrado');
            }
            const currentDate = new Date();
            const reviewDate = new Date(taxi.vencimiento_revision_tecnica);
            return reviewDate >= currentDate;
        } catch (error) {
            throw new Error(`Error checking technical review: ${error.message}`);
        }
    }

    async getAll(query) {
        try {
            const taxis = await this.repository.getAll(query);
            return taxis;
        } catch (error) {
            throw error;
        }
    }
}