const basemodel = require('./BaseModel');

class TripModel extends basemodel {
    constructor() {
        super('trips');
    }
}

module.exports = TripModel;