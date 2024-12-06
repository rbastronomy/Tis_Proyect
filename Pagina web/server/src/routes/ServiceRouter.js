import { BaseRouter } from '../core/BaseRouter.js';
import { ServiceController } from '../controllers/ServiceController.js';

export class ServiceRouter extends BaseRouter {
  constructor(provider) {
    super(provider, '/api/services');
    this.controller = new ServiceController();
    this.setupRoutes();
  }

  setupRoutes() {
    // Get services by ride type (CITY or AIRPORT)
    this.addRoute('GET', '/by-type/:rideType', {
      schema: {
        params: {
          type: 'object',
          required: ['rideType'],
          properties: {
            rideType: { 
              type: 'string',
              enum: ['CITY', 'AIRPORT']
            }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                codigos: { type: 'integer' },
                tipo: { type: 'string' },
                descripciont: { type: 'string' },
                estados: { type: 'string' }
              }
            }
          }
        }
      },
      handler: this.controller.getServicesByRideType.bind(this.controller)
    });

    // Get all services (used in frontend initial load)
    this.addRoute('GET', '/', {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              services: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    codigos: { type: 'integer' },
                    tipo: { type: 'string' },
                    descripciont: { type: 'string' },
                    estados: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      handler: this.controller.getAll.bind(this.controller)
    });

    // Get active services with their tariffs
    this.addRoute('GET', '/active', {
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                codigos: { type: 'integer' },
                tipo: { type: 'string' },
                descripciont: { type: 'string' },
                estados: { type: 'string' },
                tarifas: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      tipo: { type: 'string' },
                      descripciont: { type: 'string' },
                      precio: { type: 'number' },
                      estadot: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      handler: this.controller.getActiveServices.bind(this.controller)
    });

    // Get service tariffs filtered by ride type
    this.addRoute('GET', '/:codigos/tarifas/:rideType', {
      schema: {
        params: {
          type: 'object',
          required: ['codigos', 'rideType'],
          properties: {
            codigos: { type: 'integer' },
            rideType: { 
              type: 'string',
              enum: ['CITY', 'AIRPORT']
            }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                tipo: { type: 'string' },
                descripciont: { type: 'string' },
                precio: { type: 'number' },
                estadot: { type: 'string' }
              }
            }
          }
        }
      },
      handler: this.controller.getServiceTariffsByType.bind(this.controller)
    });

    // Admin routes
    this.addRoute('POST', '/', {
      schema: {
        body: {
          type: 'object',
          required: ['tipo', 'descripciont'],
          properties: {
            tipo: { type: 'string' },
            descripciont: { type: 'string' },
            tarifas: {
              type: 'array',
              items: {
                type: 'integer'
              },
              description: 'Array of tariff IDs to associate with the service'
            }
          }
        }
      },
      handler: this.withAuth(
        this.controller.create.bind(this.controller),
        ['gestionar_servicios'],
        ['ADMINISTRADOR']
      )
    });

    // Update service tariffs
    this.addRoute('PUT', '/:codigos/tarifas', {
      schema: {
        params: {
          type: 'object',
          required: ['codigos'],
          properties: {
            codigos: { type: 'integer' }
          }
        },
        body: {
          type: 'object',
          required: ['tarifas'],
          properties: {
            tarifas: {
              type: 'array',
              items: {
                type: 'integer'
              },
              description: 'Array of tariff IDs to associate with the service'
            }
          }
        }
      },
      handler: this.withAuth(
        this.controller.updateServiceTariffs.bind(this.controller),
        ['gestionar_servicios'],
        ['ADMINISTRADOR']
      )
    });
  }
} 