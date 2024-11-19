import { BaseController } from '../core/BaseController.js';
import { ServiceService } from '../services/ServiceService.js';

const serviceService = new ServiceService();

export class ServiceController extends BaseController {
    constructor() {
        super(serviceService);
    }

    /**
     * Creates a new service.
     * @param {Object} request - Fastify request object.
     * @param {Object} reply - Fastify reply object.
     */
    async create(request, reply) {
        const { tipo, descripciont, estados, id } = request.body;

        try {
            const newService = await serviceService.create({ 
                tipo, 
                descripciont, 
                estados, 
                id 
            });
            return reply.status(201).send({ 
                message: 'Service created successfully', 
                service: newService 
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to create service' });
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
}

export default ServiceController;