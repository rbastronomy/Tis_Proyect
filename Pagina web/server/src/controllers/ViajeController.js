import { BaseController } from "../core/BaseController.js";
import { ViajeService } from "../services/ViajeService.js";

export default class ViajeController extends BaseController{
    constructor(viajeService) {
      this.viajeService = viajeService;
    }
  
    // Route handler for getting a specific viaje
    async getViaje(request, reply) {
      try {
        const { codigo } = request.params;
        const viaje = await this.viajeService.getViajeById(codigo);
        
        return reply.code(200).send(viaje);
      } catch (error) {
        request.log.error(error);
        return reply.code(404).send({ 
          statusCode: 404,
          error: 'Not Found',
          message: error.message 
        });
      }
    }
  
    // Route handler for creating a new viaje
    async createViaje(request, reply) {
      try {
        const viajeData = request.body;
        const newViaje = await this.viajeService.createViaje(viajeData);
        
        return reply.code(201).send(newViaje);
      } catch (error) {
        request.log.error(error);
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.message
        });
      }
    }
  
    // Route handler for completing a viaje
    async completeViaje(request, reply) {
      try {
        const { codigo } = request.params;
        const additionalData = request.body;
        
        await this.viajeService.completeViaje(codigo, additionalData);
        
        return reply.code(200).send({ 
          message: 'Viaje completed successfully' 
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
  
    // Route handler for cancelling a viaje
    async cancelViaje(request, reply) {
      try {
        const { codigo } = request.params;
        
        await this.viajeService.cancelViaje(codigo);
        
        return reply.code(200).send({ 
          message: 'Viaje cancelled successfully' 
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