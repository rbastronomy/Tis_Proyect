import { BaseController } from '../core/BaseController.js';
import { ReceiptService } from '../services/ReceiptService.js';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

export default class ReceiptController extends BaseController {
    constructor() {
        const receiptService = new ReceiptService();
        super(receiptService);
        this.service = receiptService;
    }
  
    // Route handler for getting a specific receipt
    async getBoleta(request, reply) {
      try {
        const { codigo_boleta } = request.params;
        const receipt = await this.service.getReceiptById(codigo_boleta);
        
        return reply.code(200).send({
          message: 'Boleta recuperada exitosamente',
          receipt: receipt
        });
      } catch (error) {
        request.log.error(error);
        return reply.code(404).send({ 
          statusCode: 404,
          error: 'Not Found',
          message: error.message 
        });
      }
    }
  
    // Route handler for creating a new receipt
    async createBoleta(request, reply) {
      try {
        const receiptData = request.body;
        const newReceipt = await this.service.create(receiptData);
        
        return reply.code(201).send({
          message: 'Boleta creada exitosamente',
          receipt: newReceipt
        });
      } catch (error) {
        request.log.error(error);
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.message
        });
      }
    }
    
    // Route handler for cancelling a receipt
    async cancelBoleta(request, reply) {
      try {
        const { codigo_boleta } = request.params;
        await this.service.updateReceipt(codigo_boleta, { 
          estado_boleta: 'ANULADO',
          updated_at: new Date()
        });
        
        return reply.code(200).send({ 
          message: 'Boleta anulada exitosamente' 
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

    // Route handler for generating receipt PDF
    async generateReceiptPDF(request, reply) {
        try {
            const { codigo_boleta } = request.params;
            const receipt = await this.service.getReceiptById(codigo_boleta);
            
            if (!receipt) {
                return reply.code(404).send({
                    statusCode: 404,
                    error: 'Not Found',
                    message: 'Boleta no encontrada'
                });
            }

            const filePath = await this.service.generatePDF(receipt);

            // Get the filename from the path
            const fileName = path.basename(filePath);

            // Set appropriate headers
            reply.header('Content-Type', 'application/pdf');
            reply.header('Content-Disposition', `attachment; filename="${fileName}"`);

            // Create a read stream and pipe it to the response
            const stream = fs.createReadStream(filePath);
            
            // Handle stream errors
            stream.on('error', (error) => {
                request.log.error(error);
                reply.code(500).send({
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'Error reading PDF file'
                });
            });

            // Clean up the file after sending
            stream.on('end', async () => {
                try {
                    await fsPromises.unlink(filePath);
                } catch (error) {
                    request.log.error('Error cleaning up PDF file:', error);
                }
            });

            return reply.send(stream);
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