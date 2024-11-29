import { BaseRouter } from '../core/BaseRouter.js';
import { PermissionController } from '../controllers/PermissionController.js';

/**
 * Router for permission related endpoints
 * @class PermissionRouter
 * @extends BaseRouter
 */
export class PermissionRouter extends BaseRouter {
  /**
   * @param {Object} provider - The HTTP server provider instance
   */
  constructor(provider) {
    super(provider, '/api/permissions');
    this.controller = new PermissionController();
    this.setupRoutes();
  }

  setupRoutes() {
    this.addRoute('POST', '/', {
      handler: this.withAuth(
        this.controller.create.bind(this.controller),
        ['create_permission'],
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