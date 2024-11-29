import { BaseRouter } from '../core/BaseRouter.js';
import { UserController } from '../controllers/UserController.js';

/**
 * Router for user related endpoints
 * @class UserRouter
 * @extends BaseRouter
 */
export class UserRouter extends BaseRouter {
  /**
   * @param {Object} provider - The HTTP server provider instance
   */
  constructor(provider) {
    super(provider, '/api/users');
    this.controller = new UserController();
    this.setupRoutes();
  }

  setupRoutes() {
    this.addRoute('GET', '/', {
      handler: this.withAuth(
        this.controller.getAll.bind(this.controller),
        [],
        ['admin']
      )
    });

    this.addRoute('GET', '/:userId', {
      handler: this.withSession(async (request, reply) => {
        const { userId } = request.params;
        
        // Special case - allow admin or self
        if (!request.user.roles.includes('admin') && request.user.id !== parseInt(userId)) {
          throw { statusCode: 403, message: 'Forbidden: Insufficient permissions' };
        }
        
        return this.controller.getUserDetails(request, reply);
      })
    });

    this.addRoute('POST', '/', {
      handler: this.withSession(
        this.withPermissions(
          this.controller.create.bind(this.controller),
          ['create_user'],
          []
        )
      )
    });
  }
} 