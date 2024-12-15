import { BaseRouter } from "../core/BaseRouter.js";
import  ReceiptController  from "../controllers/ReceiptController.js";

export class ReceiptRouter extends BaseRouter {
    constructor(provider) {
        super(provider, '/api/receipts');
        this.controller = new ReceiptController();
        this.setupRoutes();
    }

    setupRoutes() {
        this.addRoute('POST', '/', {
            handler: this.withAuth(
                this.controller.createBoleta.bind(this.controller),
                this.controller.createBoleta.bind(this.controller),
            ),
        });
        this.addRoute('GET', '/:codigo_boleta', {
            handler: this.withAuth(
                this.controller.getBoleta.bind(this.controller),
                this.controller.getBoleta.bind(this.controller),
            ),
        });
        this.addRoute('GET', '/:codigo_boleta/receipt', {
            handler: this.withAuth(
                this.controller.generateReceiptPDF.bind(this.controller),
                this.controller.generateReceiptPDF.bind(this.controller),
            ),
        });
    }
}