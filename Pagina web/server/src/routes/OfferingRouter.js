import { BaseRouter } from '../core/BaseRouter.js';
import { OfferingController } from '../controllers/OfferingController.js';

export class OfferingRouter extends BaseRouter {
    constructor(provider) {
        super(provider, '/api/offerings');
        this.controller = new OfferingController();
        this.setupRoutes();
    }

    setupRoutes() {
        // Get offerings by service and ride type
        this.addRoute('GET', '/by-service/:codigo_servicio/:rideType', {
            schema: {
                params: {
                    type: 'object',
                    required: ['codigo_servicio', 'rideType'],
                    properties: {
                        codigo_servicio: { type: 'integer' },
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
            handler: this.controller.getOfferingsByServiceAndType.bind(this.controller)
        });
    }
} 