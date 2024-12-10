import { BaseController } from '../core/BaseController.js';
import { ReceiptService } from '../services/ReceiptService.js';

export default class ReceiptController extends BaseController {
    constructor() {
        const receiptService = new ReceiptService();
        super(receiptService);
        this.service = receiptService;
    }
  
    // Route handler for getting a specific boleta
    async getBoleta(request, reply) {
      try {
        const { codigo_boleta } = request.params;
        const boleta = await this.service.getBoletaById(codigo_boleta);
        
        return reply.code(200).send(boleta);
      } catch (error) {
        request.log.error(error);
        return reply.code(404).send({ 
          statusCode: 404,
          error: 'Not Found',
          message: error.message 
        });
      }
    }
  
    // Route handler for creating a new boleta
    async createBoleta(request, reply) {
      try {
        const boletaData = request.body;
        const newBoleta = await this.service.createBoleta(boletaData);
        
        return reply.code(201).send(newBoleta);
      } catch (error) {
        request.log.error(error);
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.message
        });
      }
    }
    
    /*
    // Route handler for updating boleta status
    async updateBoletaStatus(request, reply) {
      try {
        const { codigo_boleta } = request.params;
        const { metodo_pago } = request.body;
        
        await this.service.updateBoletaStatus(codigo_boleta, metodo_pago);
        
        return reply.code(200).send({ 
          message: 'Boleta status updated successfully' 
        });
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
    */
    // Route handler for cancelling a boleta
    async cancelBoleta(request, reply) {
      try {
        const { codigo_boleta } = request.params;
        
        await this.service.cancelBoleta(codigo_boleta);
        
        return reply.code(200).send({ 
          message: 'Boleta cancelled successfully' 
        });
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
}