const { BaseModel } = require('./BaseModel');

class RateModel extends BaseModel {
    constructor() {
        super('rates'); // Assuming 'rates' is the table name in your database
    }
    
    // Define any additional methods or overrides specific to RateModel here
}

module.exports = RateModel;