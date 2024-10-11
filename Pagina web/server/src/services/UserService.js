import { BaseService } from '../core/BaseService.js';
import { UserModel } from '../models/UserModel.js';

export class UserService extends BaseService {
  constructor() {
    const userModel = new UserModel();
    super(userModel);
  }

  async createWithTransaction(data) {
    return this.model.createWithTransaction(data);
  }
}