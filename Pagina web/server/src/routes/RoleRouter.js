import { BaseRouter } from '../core/BaseRouter.js';
import { RoleController } from '../controllers/RoleController.js';

/**
 * Router for role related endpoints
 * @class RoleRouter
 * @extends BaseRouter
 */
export class RoleRouter extends BaseRouter {
  /**
   * @param {Object} provider - The HTTP server provider instance
   */
  constructor(provider) {
    super(provider, '/api/roles');
    this.controller = new RoleController();
    this.setupRoutes();
  }

  setupRoutes() {
    this.addRoute('POST', '/', {
      handler: this.withAuth(
        this.controller.create.bind(this.controller),
        ['create_role'],
        ['admin']
      )
    });

    this.addRoute('POST', '/:roleId/permissions', {
      handler: this.withAuth(
        this.controller.assignPermission.bind(this.controller),
        ['assign_permission'],
        ['admin']
      )
    });

    this.addRoute('DELETE', '/:roleId/permissions/:permissionId', {
      handler: this.withAuth(
        this.controller.removePermission.bind(this.controller),
        ['remove_permission'],
        ['admin']
      )
    });

    this.addRoute('GET', '/', {
      handler: this.withAuth(
        this.controller.getAll.bind(this.controller),
        [],
        ['admin']
      )
    });
  }
} 