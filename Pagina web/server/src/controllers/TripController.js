import { BaseController } from "../core/BaseController";
import { TripService } from "../services/TripService";

const tripService = new TripService();

export class TripController extends BaseController {
    constructor() {
        super(tripService);
    }
    
}
module.exports = TripController;