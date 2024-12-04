import { BaseService } from "../core/BaseService";
import { ReservaRepository } from "../repository/ReservaRepository";
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

    async getReservaById(codigoreserva){
        try {
            const reserva = await this.repository.findById(codigoreserva);
            if(!reserva){
                throw new Error('Reserva not found');
            }
            return reserva;
        } catch (error) {
            console.error('Error getting reserva by id:', error);
            throw new Error('Failed to retrieve reserva details');
        }
    }

    async createReserva(reservaData){
        try {
            this.validateReservaDaata(reservaData);
            return await this.reservaRepository.create(reservaData);
        } catch (error) {
            console.error('Error creating reserva:', error);
            throw new Error('Failed to create reserva');
        }
    }

    async updateReservaUpdate(codigoreserva, reservaData){
        try {
            const reserva = await this.repository.findById(codigoreserva);
            if(!reserva){
                throw new Error('Reserva not found');
            }
            return await this.reservaRepository.update(codigoreserva,
                {
                    estados: reservaData,
                    frealizado: new Date()
                });
        } catch (error) {
            console.error('Error updating reserva:', error);
            throw new Error('Failed to update reserva');
        }
    }

    async cancelReserva(codigoreserva){
        try {
            const reserva = await this.repository.findById(codigoreserva);
            if(!reserva){
                throw new Error('Reserva not found');
            }
            if(reserva.estado === 'cancelado'){
                throw new Error('Reserva already canceled');
            }
            // Cancel all associated viajes
            const viajes = await this.viajeService.getViajesByReserva(codigoreserva);
            for(const viaje of viajes){
                await this.viajeService.cancelViaje(viaje.codigo);
            }
            // Cancel all associated boletas
            const boletas = await this.boletaService.getBoletasByReserva(codigoreserva);
            for(const boleta of boletas){
                await this.boletaService.cancelBoleta(boleta.codigo);
            }
            return await this.repository.update(codigoreserva, {estado: 'CANCELADO'});
        } catch(error) {
            console.error('Error canceling reserva:', error);
            throw new Error('Failed to cancel reserva');
        }
    }

    validateReservaData(reservaData){
        const requieredFields = ['origenv','destinov','freserva'];
        for (const field of requieredFields){
            if(!reservaData[field]){
                throw new Error(`Field ${field} is required`);
            }
        }
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