import { BaseService } from "../core/BaseService.js";
import { ReceiptRepository } from "../repository/ReceiptRepository.js";

export class ReceiptService extends BaseService {
    constructor(){
        super();
        this.repository = new ReceiptRepository();
    }

    async getBoletaById(codigo_boleta){
        try {
            const boleta = await this.repository.findById(codigo_boleta);
            if(!boleta){
                throw new Error('Boleta no encontrada');
            }
            return boleta;
        } catch (error) {
            console.error('Error obteniendo id de boleta:', error);
            throw new Error('Error al recuperar los detalles de la boleta');
        }
    }

    async createBoleta(receiptData){
        try {
            this.validateBoletaData(receiptData);
            const createdBoleta= await this.repository.create(receiptData);
            return createdBoleta;
        } catch (error) {
            console.error('Error creando boleta:', error);
            throw new Error('fallo en crear boleta');
        }
    }

    async updateBoleta(codigo_boleta, boletaData){
        try {
            const boleta = await this.repository.findById(codigo_boleta);
            if(!boleta){
                throw new Error('Boleta no encontrada');
            }
            return await this.repository.update(codigo_boleta, boletaData);
        } catch (error) {
            console.error('Error actualizado boleta:', error);
            throw new Error('fallo en actualizar boleta');
        }
    }

    async cancelBoleta(codigo_boleta){
        try {
            const boleta = await this.repository.findById(codigo_boleta);
            if(!boleta){
                throw new Error('Boleta not found');
            }
            return await this.repository.update(codigo_boleta, {
                estado_boleta: 'CANCELADA',
            });
        } catch (error) {
            console.error('Error actualizado boleta:', error);
            throw new Error('Fallo en actualizar boleta');
        }
    }

    validateBoletaData(boletaData){
        const requieredFields = ['total','fecha_emision','metodo_pago'];
        for (const field of requieredFields){
            if(!boletaData[field]){
                throw new Error(`Field ${field} is required`);
            }
        }
    }
    

}