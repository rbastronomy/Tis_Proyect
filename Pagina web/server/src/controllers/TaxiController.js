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

    /**
     * Get all taxis assigned to a specific driver
     * @param {Object} request - HTTP request object
     * @param {Object} reply - HTTP response object
     */
    async getTaxisByDriver(request, reply) {
      try {
        const { rut } = request.params;
        const taxis = await this.service.getTaxisByDriver(rut);
        
        // Ensure we're sending an array
        const taxisArray = Array.isArray(taxis) ? taxis : [taxis].filter(Boolean);
        
        reply.code(200).send(
          taxisArray.map(taxi => taxi.toJSON())
        );
      } catch (error) {
        request.log.error(error);
        reply.code(500).send({ 
          message: 'Error al obtener los taxis del conductor', 
          error: error.message 
        });
      }
    }

    /**
     * Assign a taxi to a driver
     * @param {Object} request - HTTP request object
     * @param {Object} reply - HTTP response object
     */
    async assignTaxiToDriver(request, reply) {
        try {
            const { rut } = request.params;
            const { patente } = request.body;
            const updatedTaxi = await this.service.assignTaxiToDriver(patente, rut);
            
            reply.code(200).send({
                message: 'Taxi asignado exitosamente',
                taxi: updatedTaxi.toJSON()
            });
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ 
                message: 'Error al asignar el taxi', 
                error: error.message 
            });
        }
    }

    /**
     * Unassign a taxi from a driver
     * @param {Object} request - HTTP request object
     * @param {Object} reply - HTTP response object
     */
    async unassignTaxiFromDriver(request, reply) {
        try {
            const { rut, patente } = request.params;
            const updatedTaxi = await this.service.unassignTaxiFromDriver(patente, rut);
            
            reply.code(200).send({
                message: 'Taxi desasignado exitosamente',
                taxi: updatedTaxi.toJSON()
            });
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ 
                message: 'Error al desasignar el taxi', 
                error: error.message 
            });
        }
    }

    /**
     * Get available taxis with their assigned drivers
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @returns {Promise<void>}
     */
    async getAvailableTaxisWithDrivers(req, res) {
      try {
        // Get booking time from query or use current time
        const bookingTime = req.query.fecha_reserva ? 
          new Date(req.query.fecha_reserva) : 
          new Date();

        console.log('Controller - Booking Time:', {
          fromQuery: !!req.query.fecha_reserva,
          bookingTime: bookingTime.toISOString(),
          rawQuery: req.query.fecha_reserva
        });

        const taxis = await this.service.getAvailableTaxisWithDrivers(bookingTime);
        res.send({ taxis });
      } catch (error) {
        console.error('Error getting available taxis:', error);
        res.status(500).send({ 
          error: 'Error getting available taxis',
          details: error.message 
        });
      }
    }

    /**
     * Gets driver information by RUT
     * @param {Object} request - HTTP request object
     * @param {Object} reply - HTTP response object
     */
    async getDriverInfo(request, reply) {
      try {
        const { rut } = request.params;
        const driver = await this.service.getDriverInfo(rut);
        
        reply.code(200).send({
          message: 'Driver info retrieved successfully',
          driver: driver.toJSON()
        });
      } catch (error) {
        request.log.error(error);
        reply.code(500).send({ 
          message: 'Error getting driver info', 
          error: error.message 
        });
      }
    }
}