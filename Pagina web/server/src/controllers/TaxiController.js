import { BaseController } from "../core/BaseController";
import { TaxiService } from "../services/TaxiService";

export class TaxiController extends BaseController {
    constructor() {
      const taxiService = new TaxiService();
      super(taxiService);
    }
    
    /*
    async createTaxi(request, reply) {
      try {
        const taxiData = request.body;
        const newTaxi = await this.taxiRepository.create(taxiData);
        
        reply.code(201).send(newTaxi);
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error creating taxi', 
          error: error.message 
        });
      }
    }
    */
    async updateTaxi(request, reply) {
      try {
        const { patente } = request.params;
        const updateData = request.body;
        const updatedTaxi = await this.service.updateTaxi(patente, updateData);
        
        return reply.code(200).send(updatedTaxi);
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ message: 'Error updating taxi', error: error.message });
      }
    }
  
    async getTaxiByLicensePlate(request, reply) {
      try {
        const { patente } = request.params;
        const taxi = await this.service.findByLicensePlate(patente);
        
        if (!taxi) {
          return reply.code(404).send({ message: 'Taxi not found' });
        }
        
        reply.code(200).send(taxi);
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error retrieving taxi', 
          error: error.message 
        });
      }
    }
  
    async searchTaxis(request, reply) {
      try {
        const searchCriteria = request.query;
        const taxis = await this.taxiRepository.search(searchCriteria);
        
        reply.code(200).send(taxis);
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error searching taxis', 
          error: error.message 
        });
      }
    }
  
    async deleteTaxi(request, reply) {
      try {
        const { patente } = request.params;
        const deletedTaxi = await this.taxiRepository.softDelete(patente);
        
        reply.code(200).send(deletedTaxi);
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error deleting taxi', 
          error: error.message 
        });
      }
    }
  
    async checkTechnicalReview(request, reply) {
      try {
        const { patente } = request.params;
        const isCurrentReview = await this.taxiRepository.checkTechnicalReview(patente);
        
        reply.code(200).send({ 
          patente, 
          technicalReviewCurrent: isCurrentReview 
        });
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error checking technical review', 
          error: error.message 
        });
      }
    }
    
    async listTaxis(request, reply) {
      try {
          const { 
              page = 1, 
              limit = 10, 
              sortBy = 'createdAt', 
              sortOrder = 'desc' 
          } = request.query;

          const result = await this.service.listTaxis({
              page: Number(page),
              limit: Number(limit),
              sortBy,
              sortOrder
          });
          
          return reply.code(200).send(result);
      } catch (error) {
          request.log.error(error);
          return reply.code(400).send({ 
              message: 'Error listing taxis', 
              error: error.message 
          });
      }
    }

  }