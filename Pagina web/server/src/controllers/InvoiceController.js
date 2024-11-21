import { BaseController } from "../core/BaseController";
import { InvoiceService } from "../services/InvoiceService";

const invoiceService = new InvoiceService();

export class InvoiceController extends BaseController {
    constructor() {
        super(invoiceService);
    }
    
}

module.exports = InvoiceController;