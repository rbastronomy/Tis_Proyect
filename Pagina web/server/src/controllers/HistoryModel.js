import { BaseController } from "../core/BaseController";
import { HistoryService } from "../services/HistoryService";

const historyService = new HistoryService();

class HistoryController extends BaseController {
    constructor() {
        super(historyService);
    }

}

module.exports = HistoryController;