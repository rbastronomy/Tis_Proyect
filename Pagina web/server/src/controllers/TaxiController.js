import { BaseController } from "../core/BaseController.js";
import { TaxiService } from "../services/TaxiService.js";

/**
 * Controller for taxi-related operations
 * @class TaxiController
 * @extends BaseController
 */
export class TaxiController extends BaseController {
    /**
     * Creates an instance of TaxiController
     */
    constructor() {
      const taxiService = new TaxiService();
      super(taxiService);
      this.service = taxiService;
    }
    
    /**
     * Creates a new taxi
     * @param {Object} request - HTTP request object
     * @param {Object} reply - HTTP response object
     */
    async createTaxi(request, reply) {
      try {
        const taxiData = request.body;
        const newTaxi = await this.service.createTaxi(taxiData);
        
        reply.code(201).send({
          message: 'Taxi creado exitosamente',
          taxi: newTaxi.toJSON()
        });
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error al crear el taxi', 
          error: error.message 
        });
      }
    }
    
    /**
     * Updates an existing taxi
     * @param {Object} request - HTTP request object
     * @param {Object} reply - HTTP response object
     */
    async updateTaxi(request, reply) {
      try {
        const { patente } = request.params;
        const updateData = request.body;
        const updatedTaxi = await this.service.updateTaxi(patente, updateData);
        
        reply.code(200).send({
          message: 'Taxi actualizado exitosamente',
          taxi: updatedTaxi.toJSON()
        });
      } catch (error) {
        request.log.error(error);
        if (error.message.includes('not found')) {
          reply.code(404).send({ message: 'Taxi no encontrado' });
        } else {
          reply.code(400).send({ 
            message: 'Error al actualizar el taxi', 
            error: error.message 
          });
        }
      }
    }
  
    /**
     * Gets a taxi by its license plate
     * @param {Object} request - HTTP request object
     * @param {Object} reply - HTTP response object
     */
    async getTaxiByLicensePlate(request, reply) {
      try {
        const { patente } = request.params;
        const taxi = await this.service.getTaxiByLicensePlate(patente);
        
        reply.code(200).send({
          message: 'Taxi encontrado',
          taxi: taxi.toJSON()
        });
      } catch (error) {
        request.log.error(error);
        if (error.message.includes('not found')) {
          reply.code(404).send({ message: 'Taxi no encontrado' });
        } else {
          reply.code(400).send({ 
            message: 'Error al obtener el taxi', 
            error: error.message 
          });
        }
      }
    }
  
    /**
     * Deletes a taxi
     * @param {Object} request - HTTP request object
     * @param {Object} reply - HTTP response object
     */
    async deletedTaxi(request, reply) {
      try {
        const { patente } = request.params;
        const deletedTaxi = await this.service.deleteTaxi(patente);
        
        reply.code(200).send({
          message: 'Taxi eliminado exitosamente',
          taxi: deletedTaxi.toJSON()
        });
      } catch (error) {
        request.log.error(error);
        if (error.message.includes('not found')) {
          reply.code(404).send({ message: 'Taxi no encontrado' });
        } else {
          reply.code(400).send({ 
            message: 'Error al eliminar el taxi', 
            error: error.message 
          });
        }
      }
    }
  
    /**
     * Checks technical review status of a taxi
     * @param {Object} request - HTTP request object
     * @param {Object} reply - HTTP response object
     */
    async checkTechnicalReview(request, reply) {
      try {
        const { patente } = request.params;
        const isCurrentReview = await this.service.checkTechnicalReview(patente);
        
        reply.code(200).send({ 
          patente, 
          technicalReviewCurrent: isCurrentReview,
          message: isCurrentReview ? 
            'La revisión técnica está vigente' : 
            'La revisión técnica está vencida'
        });
      } catch (error) {
        request.log.error(error);
        if (error.message.includes('not found')) {
          reply.code(404).send({ message: 'Taxi no encontrado' });
        } else {
          reply.code(400).send({ 
            message: 'Error al verificar la revisión técnica', 
            error: error.message 
          });
        }
      }
    }

    /**
     * Gets all taxis
     * @param {Object} request - HTTP request object
     * @param {Object} reply - HTTP response object
     */
    async getAll(request, reply) {
      try {
        const taxis = await this.service.getAll(request.query);
        
        reply.code(200).send({
          message: 'Taxis obtenidos exitosamente',
          taxis: taxis.map(taxi => taxi.toJSON())
        });
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error al obtener los taxis', 
          error: error.message 
        });
      }
    }
}