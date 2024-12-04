import { BaseService } from "../core/BaseService";
import ReservaRepository from "../repository/ReservaRepository";
import { ReservaModel } from "../models/ReservaModel";
import { ViajeService } from "../services/ViajeService";
import { BoletaService } from "../services/BoletaService";

export class ReservaService extends BaseService {
    constructor() {
        const reservaRepository = new ReservaRepository();
        super(reservaRepository);
        this.viajeService = new ViajeService();
        this.boletaService = new BoletaService();
    }

    async getReservasByViaje(codigo){
        try {
            return await this.repository.findByViaje(codigo);
        } catch (error) {
            console.error('Error getting reservas by viaje:', error);
            throw new Error('Failed to retrieve reservas for the viaje');
        }
    }

    async getReservasByStatus(estado){
        try {
            return await this.repository.findByStatus(estado);
        } catch (error) {
            console.error('Error getting reservas by status:', error);
            throw new Error('Failed to retrieve reservas for the status');
        }
    }

    
}