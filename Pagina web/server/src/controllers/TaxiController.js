import { BaseController } from "../core/BaseController";
import { TaxiService } from "../services/TaxiService";

export class TaxiController extends BaseController {
    constructor() {
      const taxiService = new TaxiService();
      super(taxiService);
      this.service = taxiService;
    }
    
    
    async createTaxi(request, reply) {
      try {
        const taxiData = request.body;
        const newTaxi = await this.service.createTaxi(taxiData);
        
        reply.code(201).send(newTaxi);
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error creando un taxi.', 
          error: error.message 
        });
      }
    }
    
    async updateTaxi(request, reply) {
      try {
        const { patente } = request.params;
        const updateData = request.body;
        const updatedTaxi = await this.service.updateTaxi(patente, updateData);
        if(!updatedTaxi) {
          reply.code(404).send({ message: 'Taxi no encontrado' });
          return;
        }
        return reply.code(200).send(updatedTaxi);
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ message: 'Error actualizando el taxi', error: error.message });
      }
    }
  
    async getTaxiByLicensePlate(request, reply) {
      try {
        const { patente } = request.params;
        const taxi = await this.service.getTaxiByLicensePlate(patente);
        
        if (!taxi) {
          return reply.code(404).send({ message: 'Taxi no encontrado' });
        }
        
        reply.code(200).send(taxi);
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error retornado un taxi', 
          error: error.message 
        });
      }
    }
  
    async deletedTaxi(request, reply) {
      try {
        const { patente } = request.params;
        const deletedTaxi = await this.service.deleteTaxi(patente);
        
        reply.code(200).send(deletedTaxi);
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error borrando taxi', 
          error: error.message 
        });
      }
    }
  
    async checkTechnicalReview(request, reply) {
      try {
        const { patente } = request.params;
        const isCurrentReview = await this.service.checkTechnicalReview(patente);
        
        reply.code(200).send({ 
          patente, 
          technicalReviewCurrent: isCurrentReview 
        });
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error buscando su revisión técnica', 
          error: error.message 
        });
      }
    }
}