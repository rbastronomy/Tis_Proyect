export class BaseController {
    constructor(service) {
      this.service = service;
    }
  
    async getAll(req, reply) {
      try {
        const data = await this.service.getAll();
        reply.send(data);
      } catch (error) {
        reply.status(500).send(error.message);
      }
    }
  
    async getById(req, reply) {
      try {
        const data = await this.service.getById(req.params.id);
        reply.send(data);
      } catch (error) {
        reply.status(500).send(error.message);
      }
    }
  
    async create(req, reply) {
      try {
        const data = await this.service.create(req.body);
        reply.status(201).send(data);
      } catch (error) {
        reply.status(500).send(error.message);
      }
    }
  
    async update(req, reply) {
      try {
        const data = await this.service.update(req.params.id, req.body);
        reply.send(data);
      } catch (error) {
        reply.status(500).send(error.message);
      }
    }
  
    async delete(req, reply) {
      try {
        await this.service.delete(req.params.id);
        reply.status(204).send();
      } catch (error) {
        reply.status(500).send(error.message);
      }
    }

      /**
     * Handler para obtener registros paginados
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async getPaginated(request, reply) {
      const { page = 1, pageSize = 10, orderBy, order, ...filters } = request.query;

      const result = await this.service.findWherePaginated(filters, {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        orderBy,
        order
      });

      return reply.code(200).send(result);
    }

    /**
     * Handles errors in a standardized way
     * @param {import('fastify').FastifyReply} reply - Fastify reply object
     * @param {Error} error - Error to handle
     */
    handleError(reply, error) {
        console.error('Controller Error:', error);

        if (error.message.includes('no encontrada') || error.message.includes('not found')) {
            return reply.code(404).send({ 
                error: 'Not Found',
                message: error.message 
            });
        }

        if (error.message.includes('No autorizado') || error.message.includes('unauthorized')) {
            return reply.code(403).send({ 
                error: 'Forbidden',
                message: error.message 
            });
        }

        return reply.code(500).send({ 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
  }
  