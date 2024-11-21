const BaseModel = require('./BaseModel');

class BookingModel extends BaseModel {
    constructor() {
        super('bookings');
    }

    // Define any additional methods or overrides specific to BookingModel here
}

module.exports = BookingModel;