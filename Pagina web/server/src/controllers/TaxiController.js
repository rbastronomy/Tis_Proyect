

export class TaxiController {
    constructor(taxiRepository) {
      this.taxiRepository = taxiRepository;
    }
  
    /**
     * Create a new taxi
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     */
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
  
    /**
     * Update an existing taxi
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     */
    async updateTaxi(request, reply) {
      try {
        const { patente } = request.params;
        const updateData = request.body;
        const updatedTaxi = await this.taxiRepository.update(patente, updateData);
        
        reply.code(200).send(updatedTaxi);
      } catch (error) {
        request.log.error(error);
        reply.code(400).send({ 
          message: 'Error updating taxi', 
          error: error.message 
        });
      }
    }
  
    /**
     * Get taxi by license plate
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     */
    async getTaxiByLicensePlate(request, reply) {
      try {
        const { patente } = request.params;
        const taxi = await this.taxiRepository.findByLicensePlate(patente);
        
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
  
    /**
     * Search taxis
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     */
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
  
    /**
     * Soft delete a taxi
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     */
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
  
    /**
     * Check technical review status
     * @param {Object} request - Fastify request object
     * @param {Object} reply - Fastify reply object
     */
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
  }