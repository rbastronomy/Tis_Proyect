import { BaseRouter } from '../core/BaseRouter.js';
import { TaxiController } from '../controllers/TaxiController.js';

/**
 * Router for taxi related endpoints
 * @class TaxiRouter
 * @extends BaseRouter
 */
export class TaxiRouter extends BaseRouter {
  /**
   * @param {Object} provider - The HTTP server provider instance
   */
  constructor(provider) {
    super(provider, '/api/taxis');
    this.controller = new TaxiController();
    this.setupRoutes();
  }

  setupRoutes() {
    // Get all taxis (with optional filters)
    this.addRoute('GET', '', {
      handler: this.withAuth(
        this.controller.getAll.bind(this.controller),
        [],
        ['ADMINISTRADOR']
      )
    });

    // Get single taxi by patente
    this.addRoute('GET', '/:patente', {
      handler: this.withAuth(
        this.controller.getTaxiByLicensePlate.bind(this.controller),
        ['ver_taxis'],
        ['ADMINISTRADOR']
      )
    });

    // Create new taxi
    this.addRoute('POST', '/', {
      handler: this.withAuth(
        this.controller.createTaxi.bind(this.controller),
        ['crear_taxi'],
        ['ADMINISTRADOR']
      )
    });

    // Update taxi
    this.addRoute('PUT', '/:patente', {
      handler: this.withAuth(
        this.controller.updateTaxi.bind(this.controller),
        ['editar_taxi'],
        ['ADMINISTRADOR']
      )
    });

    // Delete taxi
    this.addRoute('DELETE', '/:patente', {
      handler: this.withAuth(
        this.controller.deletedTaxi.bind(this.controller),
        ['eliminar_taxi'],
        ['ADMINISTRADOR']
      )
    });

    // Check technical review
    this.addRoute('GET', '/:patente/technical-review', {
      handler: this.withAuth(
        this.controller.checkTechnicalReview.bind(this.controller),
        ['ver_taxis'],
        ['ADMINISTRADOR']
      )
    });

    // Get taxis by driver
    this.addRoute('GET', '/driver/:rut', {
      handler: this.withAuth(
        this.controller.getTaxisByDriver.bind(this.controller),
        ['ver_taxis'],
        ['ADMINISTRADOR']
      )
    });

    // Assign taxi to driver
    this.addRoute('POST', '/driver/:rut', {
      handler: this.withAuth(
        this.controller.assignTaxiToDriver.bind(this.controller),
        ['asignar_taxi'],
        ['ADMINISTRADOR']
      )
    });

    // Unassign taxi from driver
    this.addRoute('DELETE', '/driver/:rut/:patente', {
      handler: this.withAuth(
        this.controller.unassignTaxiFromDriver.bind(this.controller),
        ['asignar_taxi'],
        ['ADMINISTRADOR']
      )
    });
  }
} 