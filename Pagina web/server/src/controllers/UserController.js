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
}