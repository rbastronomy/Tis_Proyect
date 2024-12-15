import { BaseRouter } from "../core/BaseRouter.js";
import ReceiptController from "../controllers/ReceiptController.js";

export class ReceiptRouter extends BaseRouter {
    constructor(provider) {
        super(provider, '/api/receipts');
        this.controller = new ReceiptController();
        this.setupRoutes();
    }

    setupRoutes() {
        // Create new receipt
        this.addRoute('POST', '/', {
            schema: {
                body: {
                    type: 'object',
                    required: ['total', 'fecha_emision', 'metodo_pago'],
                    properties: {
                        total: { 
                            type: 'number',
                            minimum: 0 
                        },
                        fecha_emision: { 
                            type: 'string',
                            format: 'date-time'
                        },
                        metodo_pago: { 
                            type: 'string',
                            enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']
                        },
                        descripcion_boleta: {
                            type: 'string',
                            maxLength: 256
                        }
                    }
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            receipt: {
                                type: 'object',
                                properties: {
                                    codigo_boleta: { type: 'integer' },
                                    total: { type: 'number' },
                                    fecha_emision: { type: 'string' },
                                    metodo_pago: { type: 'string' },
                                    descripcion_boleta: { type: 'string' },
                                    estado_boleta: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            },
            handler: this.withAuth(
                this.controller.createBoleta.bind(this.controller),
                ['crear_boleta'],
                ['CONDUCTOR', 'CLIENTE', 'ADMINISTRADOR']
            )
        });

        // Get receipt by ID
        this.addRoute('GET', '/:codigo_boleta', {
            schema: {
                params: {
                    type: 'object',
                    required: ['codigo_boleta'],
                    properties: {
                        codigo_boleta: { type: 'integer' }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            receipt: {
                                type: 'object',
                                properties: {
                                    codigo_boleta: { type: 'integer' },
                                    total: { type: 'number' },
                                    fecha_emision: { type: 'string' },
                                    metodo_pago: { type: 'string' },
                                    descripcion_boleta: { type: 'string' },
                                    estado_boleta: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            },
            handler: this.withAuth(
                this.controller.getBoleta.bind(this.controller),
                ['ver_reservas'],
                ['CONDUCTOR', 'CLIENTE', 'ADMINISTRADOR']
            )
        });

        // Download receipt PDF
        this.addRoute('GET', '/:codigo_boleta/pdf', {
            schema: {
                params: {
                    type: 'object',
                    required: ['codigo_boleta'],
                    properties: {
                        codigo_boleta: { type: 'integer' }
                    }
                },
                response: {
                    200: {
                        type: 'string',
                        format: 'binary'
                    }
                }
            },
            handler: this.withAuth(
                this.controller.generateReceiptPDF.bind(this.controller),
                ['ver_reservas'],
                ['CONDUCTOR', 'CLIENTE', 'ADMINISTRADOR']
            )
        });

        // Cancel receipt
        this.addRoute('POST', '/:codigo_boleta/cancel', {
            schema: {
                params: {
                    type: 'object',
                    required: ['codigo_boleta'],
                    properties: {
                        codigo_boleta: { type: 'integer' }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' }
                        }
                    }
                }
            },
            handler: this.withAuth(
                this.controller.cancelBoleta.bind(this.controller),
                ['anular_boleta'],
                ['ADMINISTRADOR']
            )
        });
    }
}