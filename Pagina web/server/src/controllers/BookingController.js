import { BaseController } from "../core/BaseController";
import { BookingService } from "../services/BookingService";

const bookingService = new BookingService();

class BookingController extends BaseController {
    constructor() {
        super(bookingService);
    }

}

module.exports = BookingController;