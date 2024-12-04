import { BaseController } from '../core/BaseController.js';
import { ServiceService } from '../services/ServiceService.js';


const serviceService = new ServiceService();

export class ServiceController extends BaseController {
    constructor() {
        super(serviceService);
    }

    /**
     * Retrieves all active services with their associated tariffs
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<Object>} Response object containing active services and their tariffs
     */
    async getActiveServices(request, reply) {
        try {
            const services = await serviceService.findActiveWithTariffs();
            return reply.send({ services });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retrieve active services' });
        }
    }

    /**
     * Get all tariffs associated with a specific service
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<Array>} Array of tariffs for the service
     */
    async getServiceTariffs(request, reply) {
        const { codigos } = request.params;

        try {
            const tariffs = await serviceService.getServiceTariffs(codigos);
            return reply.send(tariffs);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ 
                error: 'Failed to retrieve service tariffs',
                details: error.message 
            });
        }
    }

    /**
     * Creates a new service with associated tariffs
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<Object>} Response object containing new service data
     */
    async create(request, reply) {
        const { tipo, descripciont, estados, tarifas } = request.body;

        try {
            const newService = await serviceService.createWithTariffs({ 
                tipo, 
                descripciont, 
                estados,
                tarifas 
            });
            return reply.status(201).send({ 
                message: 'Service created successfully', 
                service: newService 
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ 
                error: 'Failed to create service',
                details: error.message 
            });
        }
    }

    /**
     * Updates the tariffs associated with a service
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<Object>} Response with updated service data
     */
    async updateServiceTariffs(request, reply) {
        const { codigos } = request.params;
        const { tarifas } = request.body;

        try {
            const updatedService = await serviceService.updateTariffs(codigos, tarifas);
            return reply.send({
                message: 'Service tariffs updated successfully',
                service: updatedService
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                error: 'Failed to update service tariffs',
                details: error.message
            });
        }
    }

    /**
     * Requests a service for a specific reservation and person.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async requestService(request, reply) {
        const { rut, codigoreserva, codigos } = request.body;

        try {
            const serviceRequest = await serviceService.requestService({
                rut, 
                codigoreserva, 
                codigos,
                fechasolicitud: new Date()
            });
            return reply.status(201).send({ 
                message: 'Service requested successfully', 
                serviceRequest 
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to request service' });
        }
    }

    /**
     * Retrieves services for a specific person.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async getPersonServices(request, reply) {
        const { rut } = request.params;

        try {
            const services = await serviceService.getPersonServices(rut);
            return reply.send({ services });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retrieve person services' });
        }
    }

    /**
     * Updates an existing service.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async update(request, reply) {
        const { codigos } = request.params;
        const updateData = request.body;

        try {
            const updatedService = await serviceService.update(codigos, updateData);
            return reply.send({ 
                message: 'Service updated successfully', 
                service: updatedService 
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to update service' });
        }
    }

    /**
     * Deletes (soft delete) a service.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async delete(request, reply) {
        const { codigos } = request.params;

        try {
            await serviceService.delete(codigos);
            return reply.send({ message: 'Service deleted successfully' });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to delete service' });
        }
    }

    /**
     * Retrieves all services.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async getAll(request, reply) {
        try {
            const services = await serviceService.getAll();
            return reply.send({ services });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to retrieve services' });
        }
    }

    /**
     * Get services filtered by ride type
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<Array>} Array of services for the specified ride type
     */
    async getServicesByRideType(request, reply) {
        const { rideType } = request.params;
        
        try {
            const services = await serviceService.findByRideType(rideType);
            return reply.send(services);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ 
                error: 'Failed to retrieve services by ride type',
                details: error.message 
            });
        }
    }

    /**
     * Get service tariffs filtered by ride type
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     * @returns {Promise<Array>} Array of tariffs filtered by ride type
     */
    async getServiceTariffsByType(request, reply) {
        const { codigos, rideType } = request.params;

        try {
            const tariffs = await serviceService.getTariffsByType(codigos, rideType);
            return reply.send(tariffs);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ 
                error: 'Failed to retrieve service tariffs by type',
                details: error.message 
            });
        }
    }
}

export default ServiceController;