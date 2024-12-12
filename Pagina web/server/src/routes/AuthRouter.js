import { BaseRouter } from '../core/BaseRouter.js';
import { AuthController } from '../controllers/AuthController.js';

/**
 * Router for authentication related endpoints
 * @class AuthRouter
 * @extends BaseRouter
 */
export class AuthRouter extends BaseRouter {
  /**
   * @param {Object} provider - The HTTP server provider instance
   */
  constructor(provider) {
    super(provider, '/api/auth');
    this.controller = new AuthController();
    this.setupRoutes();
  }

  setupRoutes() {
    // Login route
    this.addRoute('POST', '/login', {
      handler: this.withErrorHandler(
        this.controller.login.bind(this.controller)
      )
    });

    // Register route - This will handle both regular users and drivers
    this.addRoute('POST', '/register', {
      handler: this.withErrorHandler(
        this.controller.register.bind(this.controller)
      )
    });

    // Logout route
    this.addRoute('POST', '/logout', {
      handler: this.withErrorHandler(
        this.controller.logout.bind(this.controller)
      )
    });

    // Session validation route
    this.addRoute('GET', '/validate-session', {
      handler: this.withErrorHandler(
        this.controller.validateSession.bind(this.controller)
      )
    });
  }
} 