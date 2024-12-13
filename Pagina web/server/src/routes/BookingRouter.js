import { BaseRouter } from '../core/BaseRouter.js';
import BookingController from '../controllers/BookingController.js';

/**
 * Router for booking related endpoints
 * @class BookingRouter
 * @extends BaseRouter
 */
export class BookingRouter extends BaseRouter {
  /**
   * @param {Object} provider - The HTTP server provider instance
   */
  constructor(provider) {
    super(provider, '/api/bookings');
    this.controller = new BookingController();
    this.setupRoutes();
  }

  setupRoutes() {
    // Create booking request
    this.addRoute('POST', '/', {
      schema: {
        body: {
          type: 'object',
          required: [
            'origen_reserva', 
            'destino_reserva', 
            'fecha_reserva', 
            'codigo_servicio', 
            'id_tarifa',
            'tipo_reserva'
          ],
          properties: {
            origen_reserva: { 
              type: 'string',
              minLength: 1,
              maxLength: 256
            },
            destino_reserva: { 
              type: 'string',
              minLength: 1,
              maxLength: 256
            },
            fecha_reserva: { 
              type: 'string', 
              format: 'date-time' 
            },
            tipo_reserva: {
              type: 'string',
              enum: ['CIUDAD', 'AEROPUERTO']
            },
            observacion_reserva: { 
              type: 'string',
              maxLength: 256
            },
            codigo_servicio: {
              type: 'integer',
              description: 'Código del servicio solicitado'
            },
            id_tarifa: {
              type: 'integer',
              description: 'ID de la tarifa seleccionada del servicio'
            }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              reserva: {
                type: 'object',
                properties: {
                  codigo_reserva: { type: 'integer' },
                  origen_reserva: { type: 'string' },
                  destino_reserva: { type: 'string' },
                  fecha_reserva: { type: 'string' },
                  tipo_reserva: { type: 'string' },
                  observacion_reserva: { type: 'string' },
                  estado_reserva: { type: 'string', enum: ['EN_REVISION'] },
                  servicio: {
                    type: 'object',
                    properties: {
                      codigo_servicio: { type: 'integer' },
                      tipo_servicio: { type: 'string' },
                      tarifa: {
                        type: 'object',
                        properties: {
                          id_tarifa: { type: 'integer' },
                          tipo_tarifa: { type: 'string' },
                          precio_tarifa: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      handler: this.withAuth(
        this.controller.createBooking.bind(this.controller),
        ['crear_reserva'],
        ['CLIENTE', 'ADMINISTRADOR']
      )
    });

    // Admin validates and assigns driver
    this.addRoute('POST', '/:codigoreserva/validate', {
      schema: {
        params: {
          type: 'object',
          required: ['codigoreserva'],
          properties: {
            codigoreserva: { 
              type: 'integer',
              description: 'Código de la reserva a validar'
            }
          }
        },
        body: {
          type: 'object',
          required: ['estados'],
          properties: {
            estados: { 
              type: 'string',
              enum: ['APROBAR', 'RECHAZAR'],
              description: 'APROBAR cambia estado a PENDIENTE y asigna conductor y taxi, RECHAZAR cambia estado a RECHAZADO'
            },
            rut_conductor: { 
              type: 'integer',
              description: 'RUT del conductor asignado (requerido si estados es APROBAR)'
            },
            patente_taxi: {
              type: 'string',
              description: 'Patente del taxi asignado (requerido si estados es APROBAR)'
            },
            observacion: {
              type: 'string',
              maxLength: 256,
              description: 'Motivo de la decisión (opcional para aprobación, requerido para rechazo)'
            }
          },
          if: {
            properties: { 
              estados: { const: 'APROBAR' } 
            }
          },
          then: {
            required: ['rut_conductor', 'patente_taxi']
          },
          else: {
            required: ['observacion']
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              reserva: {
                type: 'object',
                properties: {
                  codigoreserva: { type: 'integer' },
                  estados: { 
                    type: 'string', 
                    enum: ['PENDIENTE', 'RECHAZADO']
                  },
                  rut_conductor: { 
                    type: 'integer',
                    nullable: true
                  },
                  patente_taxi: {
                    type: 'string',
                    nullable: true
                  },
                  observacion: { type: 'string' }
                }
              }
            }
          }
        }
      },
      handler: this.withAuth(
        this.controller.validateAndAssignDriver.bind(this.controller),
        ['validar_reserva'],
        ['ADMINISTRADOR']
      )
    });

    // Driver starts trip
    this.addRoute('POST', '/:codigoreserva/start', {
      schema: {
        params: {
          type: 'object',
          required: ['codigoreserva'],
          properties: {
            codigoreserva: { type: 'integer' }
          }
        }
      },
      handler: this.withAuth(
        this.controller.startTrip.bind(this.controller),
        ['gestionar_viajes'],
        ['CONDUCTOR']
      )
    });

    // Driver completes trip
    this.addRoute('POST', '/:codigoreserva/complete', {
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
          required: ['duracion', 'observacion'],
          properties: {
            duracion: { type: 'number' },
            observacion: { type: 'string' }
          }
        }
      },
      handler: this.withAuth(
        this.controller.completeTrip.bind(this.controller),
        ['gestionar_viajes'],
        ['CONDUCTOR']
      )
    });

    // Get reservas with filters
    this.addRoute('GET', '/', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            estados: { 
              type: 'string',
              enum: ['EN_REVISION', 'PENDIENTE', 'EN_CAMINO', 'COMPLETADO', 'RECHAZADO']
            },
            freserva: { type: 'string', format: 'date' },
            rut_conductor: { type: 'integer' }
          }
        }
      },
      handler: this.withAuth(
        this.controller.getBookings.bind(this.controller),
        ['ver_reservas'],
        ['ADMINISTRADOR', 'CONDUCTOR']
      )
    });

    // Cancel reserva
    this.addRoute('POST', '/:codigoreserva/cancel', {
      schema: {
        params: {
          type: 'object',
          required: ['codigoreserva'],
          properties: {
            codigoreserva: { type: 'integer' }
          }
        }
      },
      handler: this.withAuth(
        this.controller.cancelBooking.bind(this.controller),
        ['cancelar_reserva'],
        ['CLIENTE', 'ADMINISTRADOR']
      )
    });

    // Get pending reservas
    this.addRoute('GET', '/pending', {
      handler: this.withAuth(
        this.controller.getReservasPendientes.bind(this.controller),
        ['ver_reservas'],
        ['ADMINISTRADOR', 'CONDUCTOR']
      )
    });

    // Get single reserva by code
    this.addRoute('GET', '/:codigoreserva', {
      schema: {
        params: {
          type: 'object',
          required: ['codigoreserva'],
          properties: {
            codigoreserva: { type: 'integer' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              reserva: {
                type: 'object',
                properties: {
                  codigo_reserva: { type: 'integer' },
                  origen_reserva: { type: 'string' },
                  destino_reserva: { type: 'string' },
                  fecha_reserva: { type: 'string' },
                  tipo_reserva: { type: 'string' },
                  observacion_reserva: { type: 'string' },
                  estado_reserva: { type: 'string' },
                  rut_conductor: { type: 'integer', nullable: true },
                  patente_taxi: { type: 'string', nullable: true },
                  servicio: {
                    type: 'object',
                    properties: {
                      tipo: { type: 'string' },
                      descripcion: { type: 'string' }
                    }
                  },
                  tarifa: {
                    type: 'object',
                    properties: {
                      precio: { type: 'number' },
                      descripcion: { type: 'string' },
                      tipo: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      handler: this.withAuth(
        this.controller.getBookingByCode.bind(this.controller),
        ['ver_reservas'],
        ['CLIENTE', 'ADMINISTRADOR', 'CONDUCTOR']
      )
    });
  }
} 