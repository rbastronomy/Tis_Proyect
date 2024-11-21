import { BaseController } from "../core/BaseController";
import { RateService } from "../services/RateService";

const rateService = new RateService();

export class RateController extends BaseController {
    constructor() {
        super(rateService);
    }
    
}

module.exports = RateController;