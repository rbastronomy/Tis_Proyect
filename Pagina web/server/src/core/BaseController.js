
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
  }
  