import { BaseRouter } from '../core/BaseRouter.js';
import { TripController } from '../controllers/TripController.js';

/**
 * Router for trip related endpoints
 * @class TripRouter
 * @extends BaseRouter
 */
export class TripRouter extends BaseRouter {
    /**
     * @param {Object} provider - The HTTP server provider instance
     */
    constructor(provider) {
        super(provider, '/api/trips');
        this.controller = new TripController();
        this.setupRoutes();
    }

    setupRoutes() {
        // Create trip from completed booking
        this.addRoute('POST', '/complete/:codigoreserva', {
            schema: {
                params: {
                    type: 'object',
                    required: ['codigoreserva'],
                    properties: {
                        codigoreserva: { type: 'integer' }
                    }
                },
                body: {
                    type: 'object',
                    required: ['duracion', 'pasajeros', 'metodo_pago'],
                    properties: {
                        duracion: { 
                            type: 'integer', 
                            minimum: 1 
                        },
                        pasajeros: { 
                            type: 'integer', 
                            minimum: 1 
                        },
                        metodo_pago: { 
                            type: 'string',
                            enum: ['EFECTIVO', 'TRANSFERENCIA']
                        },
                        observacion_viaje: { 
                            type: 'string', 
                            maxLength: 256,
                            default: '' 
                        }
                    },
                    additionalProperties: false 
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            trip: {
                                type: 'object',
                                properties: {
                                    codigo_viaje: { type: 'integer' },
                                    origen_viaje: { type: 'string' },
                                    destino_viaje: { type: 'string' },
                                    duracion: { type: 'number' },
                                    pasajeros: { type: 'integer' },
                                    fecha_viaje: { type: 'string' },
                                    estado_viaje: { type: 'string' },
                                    receipt: {
                                        type: 'object',
                                        properties: {
                                            codigo_boleta: { type: 'integer' },
                                            total: { type: 'number' },
                                            fecha_emision: { type: 'string' },
                                            metodo_pago: { type: 'string' },
                                            estado_boleta: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            handler: this.withAuth(
                this.controller.createFromBooking.bind(this.controller),
                ['completar_viaje'],
                ['CONDUCTOR']
            )
        });

        // Get driver's trips
        this.addRoute('GET', '/driver/:driverId', {
            schema: {
                params: {
                    type: 'object',
                    required: ['driverId'],
                    properties: {
                        driverId: { type: 'integer' }
                    }
                }
            },
            handler: this.withAuth(
                this.controller.getDriverTrips.bind(this.controller),
                ['ver_viajes'],
                ['CONDUCTOR']
            )
        });

        // Get client's trips
        this.addRoute('GET', '/client/:clientId', {
            schema: {
                params: {
                    type: 'object',
                    required: ['clientId'],
                    properties: {
                        clientId: { type: 'integer' }
                    }
                }
            },
            handler: this.withAuth(
                this.controller.getClientTrips.bind(this.controller),
                ['ver_viajes'],
                ['CLIENTE']
            )
        });

        // Get trip details
        this.addRoute('GET', '/details/:codigoReserva', {
            schema: {
                params: {
                    type: 'object',
                    required: ['codigoReserva'],
                    properties: {
                        codigoReserva: { type: 'integer' }
                    }
                }
            },
            handler: this.withAuth(
                this.controller.getTripDetails.bind(this.controller),
                ['ver_reservas'],
                ['CONDUCTOR', 'CLIENTE', 'ADMINISTRADOR']
            )
        });
    }
}

export default TripRouter;

