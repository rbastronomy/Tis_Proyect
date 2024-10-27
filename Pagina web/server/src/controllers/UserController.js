import { BaseController } from '../core/BaseController.js';
import { UserService } from '../services/UserService.js';

const userService = new UserService();

export class UserController extends BaseController {
  constructor() {
    super(userService);
  }

  /**
   * Retrieves a user's details.
   * @param {Object} request - Fastify request object.
   * @param {Object} reply - Fastify reply object.
   */
  async getUserDetails(request, reply) {
    const { userId } = request.params;

    try {
      const user = await userService.model.getById(userId);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const roles = await userService.getRoles(user.id);
      const permissions = await userService.getPermissions(user.id);

      return reply.send({ user, roles, permissions });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to retrieve user details' });
    }
  }

  // Additional user-specific endpoints if needed
}