const BaseModel = require('./BaseModel');

class InvoiceModel extends BaseModel {
    constructor() {
        super('invoices');
    }

    // Define any additional methods or overrides specific to InvoiceModel here
}

module.exports = InvoiceModel;