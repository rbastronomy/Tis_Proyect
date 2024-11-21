import { BaseController } from "../core/BaseController";
import { RatingService } from "../services/RatingService";

const ratingService = new RatingService();

export class RatingController extends BaseController {
    constructor() {
        super(ratingService);
    }
    
}

module.exports = RatingController;  