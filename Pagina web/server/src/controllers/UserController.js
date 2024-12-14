import { BaseController } from '../core/BaseController.js';
import { UserService } from '../services/UserService.js';

export class UserController extends BaseController {
  constructor() {
    const userService = new UserService();
    super(userService);
  }

  async getUserDetails(request, reply) {
    const { rut } = request.params;

    try {
      const user = await this.service.getUserWithAuth(rut);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send({ 
        user: user.toJSON(),
        role: user.role,
        permissions: user.permissions
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to retrieve user details' });
    }
  }

  async updateUser(request, reply) {
    const { rut } = request.params;
    const userData = request.body;

    try {
      const updatedUser = await this.service.update(rut, userData);
      return reply.send({ user: updatedUser.toJSON() });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to update user' });
    }
  }

  async listUsers(request, reply) {
    try {
      const users = await this.service.getAll();
      return reply.send({ users: users.map(user => user.toJSON()) });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to list users' });
    }
  }

  /**
   * Gets all users with driver role
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Array>} Array of driver users
   */
  async getDrivers(request, reply) {
    try {
      const drivers = await this.service.findAll({ id_roles: 3 });
      return reply.send({ drivers: drivers.map(driver => driver.toJSON()) });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to retrieve drivers' });
    }
  }

  /**
   * Soft deletes a driver user
   * @param {Object} request - Fastify request object
   * @param {Object} reply - Fastify reply object
   * @returns {Promise<Object>} Response object
   */
  async deleteDriver(request, reply) {
    const { rut } = request.params;

    try {
      // First check if the driver exists and is a driver
      const driver = await this.service.findOne({ rut, id_roles: 3 });
      if (!driver) {
        request.log.error(`Driver not found with RUT: ${rut}`);
        return reply.status(404).send({ error: 'Driver not found' });
      }

      const result = await this.service.softDelete(rut);
      if (!result) {
        request.log.error(`Failed to delete driver with RUT: ${rut}`);
        return reply.status(500).send({ error: 'Failed to delete driver' });
      }

      request.log.info(`Successfully deleted driver with RUT: ${rut}`);
      return reply.send({ 
        message: 'Driver deleted successfully',
        driver: result
      });
    } catch (error) {
      request.log.error(error, `Error deleting driver with RUT: ${rut}`);
      return reply.status(500).send({ 
        error: 'Failed to delete driver',
        details: error.message
      });
    }
  }

  /**
   * Get detailed information about a specific driver
   * @param {FastifyRequest} request - The request object
   * @param {FastifyReply} reply - The reply object
   * @returns {Promise<Object>} The driver details
   */
  async getDriverDetails(request, reply) {
    try {
      const { rut } = request.params;
      
      const driver = await this.service.findDriverByRut(rut, {
        include: {
          role: {
            include: {
              permissions: true
            }
          }
        }
      });

      if (!driver) {
        return reply.code(404).send({
          message: 'Conductor no encontrado'
        });
      }

      return reply.code(200).send(driver);
    } catch (error) {
      console.error('Error in getDriverDetails:', error);
      return reply.code(500).send({
        message: 'Error al obtener detalles del conductor',
        error: error.message
      });
    }
  }
}