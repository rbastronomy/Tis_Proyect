import { BaseService } from "../core/BaseService";
import { BoletaRepository } from "../repository/BoletaRepository";

export class BoletaService extends BaseService {
    constructor(){
        const boletaRepository = new BoletaRepository();
        super(boletaRepository);
    }

    async getBoletaById(codigoboleta){
        try {
            const boleta = await this.repository.findById(codigoboleta);
            if(!boleta){
                throw new Error('Boleta not found');
            }
            return boleta;
        } catch (error) {
            console.error('Error getting boleta by id:', error);
            throw new Error('Failed to retrieve boleta details');
        }
    }

    async createBoleta(boletaData){
        try {
            this.validateBoletaData(boletaData);
            return await this.boletaRepository.create(boletaData);
        } catch (error) {
            console.error('Error creating boleta:', error);
            throw new Error('Failed to create boleta');
        }
    }

    async updateBoleta(codigoboleta, boletaData){
        try {
            const boleta = await this.repository.findById(codigoboleta);
            if(!boleta){
                throw new Error('Boleta not found');
            }
            return await this.boletaRepository.update(codigoboleta, boletaData);
        } catch (error) {
            console.error('Error updating boleta:', error);
            throw new Error('Failed to update boleta');
        }
    }

    async cancelBoleta(codigoboleta){
        try {
            const boleta = await this.repository.findById(codigoboleta);
            if(!boleta){
                throw new Error('Boleta not found');
            }
            return await this.boletaRepository.update(codigoboleta, {
                estado: 'cancelado',
            });
        } catch (error) {
            console.error('Error updating boleta:', error);
            throw new Error('Failed to update boleta');
        }
    }

    validateBoletaData(boletaData){
        const requieredFields = ['total','femision','metodopago'];
        for (const field of requieredFields){
            if(!boletaData[field]){
                throw new Error(`Field ${field} is required`);
            }
        }
    }
    

}