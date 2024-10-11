import { BaseController } from '../core/BaseController.js';
import { UserService } from '../services/UserService.js';

const userService = new UserService();
export class UserController extends BaseController {
  constructor() {
    super(userService);
  }
}