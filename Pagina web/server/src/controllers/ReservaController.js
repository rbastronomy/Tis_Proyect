import { BaseController } from "../core/BaseController";
import { ReservaService } from "../services/ViajeService";

export default class ReservaController extends BaseController {
    constructor(reservaService) {
      this.reservaService = reservaService;
    }
  
    // Route handler for getting a specific reserva
    async getReserva(request, reply) {
      try {
        const { codigoreserva } = request.params;
        const reserva = await this.reservaService.getReservaById(codigoreserva);
        
        return reply.code(200).send(reserva);
      } catch (error) {
        request.log.error(error);
        return reply.code(404).send({ 
          statusCode: 404,
          error: 'Not Found',
          message: error.message 
        });
      }
    }
  
    // Route handler for creating a new reserva
    async createReserva(request, reply) {
      try {
        const reservaData = request.body;
        const newReserva = await this.reservaService.createReserva(reservaData);
        
        return reply.code(201).send(newReserva);
      } catch (error) {
        request.log.error(error);
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.message
        });
      }
    }
  
    // Route handler for updating reserva status
    async updateReservaStatus(request, reply) {
      try {
        const { codigoreserva } = request.params;
        const { status } = request.body;
        
        await this.reservaService.updateReservaStatus(codigoreserva, status);
        
        return reply.code(200).send({ 
          message: 'Reserva status updated successfully' 
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
  
    // Route handler for cancelling a reserva
    async cancelReserva(request, reply) {
      try {
        const { codigoreserva } = request.params;
        
        await this.reservaService.cancelReserva(codigoreserva);
        
        return reply.code(200).send({ 
          message: 'Reserva cancelled successfully' 
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