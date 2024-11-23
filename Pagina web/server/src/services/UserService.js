import { BaseService } from '../core/BaseService.js';
import auth from '../auth/auth.js';
import UserRepository from '../repository/UserRepository.js';

export class UserService extends BaseService {
  constructor() {
    const userRepository = new UserRepository();
    super(userRepository);
    this.auth = auth;
  }

  async getUserWithAuth(rut) {
    const user = await this.repository.findByRut(rut);
    if (!user) return null;

    const roles = await this.repository.getRoles(rut);
    const permissions = await this.repository.getPermissions(rut);
    
    user.role = roles[0]?.nombrerol;
    user.permissions = permissions.map(p => p.nombrepermiso);
    
    return user;
  }

  async register(userData) {
    try {
      // Check if user exists
      const existingUser = await this.repository.findByEmail(userData.correo);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create user in database
      const user = await this.repository.create(userData);

      // Create Lucia auth user
      const authUser = await this.auth.createUser({
        key: {
          providerId: "email",
          providerUserId: userData.correo.toLowerCase(),
          password: userData.contrasena // Lucia will hash this
        },
        attributes: user.toAuthAttributes()
      });

      // Assign default role if specified
      if (userData.idroles) {
        await this.repository.assignRole(user.rut, userData.idroles);
      }

      // Create session
      const session = await this.auth.createSession({
        userId: authUser.userId,
        attributes: {}
      });

      return { user, session };
    } catch (error) {
      throw error;
    }
  }

  async login(identifier, password) {
    try {
      // Find user by key and validate password using Lucia
      const key = await this.auth.useKey(
        "email",
        identifier.toLowerCase(),
        password
      );

      // Get user with roles and permissions
      const user = await this.getUserWithAuth(key.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create new session
      const session = await this.auth.createSession({
        userId: key.userId,
        attributes: {}
      });

      return { user, session };
    } catch (error) {
      throw error;
    }
  }

  async logout(sessionId) {
    try {
      await this.auth.invalidateSession(sessionId);
    } catch (error) {
      throw error;
    }
  }

  async validateSession(sessionId) {
    try {
      return await this.auth.validateSession(sessionId);
    } catch (error) {
      throw error;
    }
  }

  async getByEmail(email) {
    return this.repository.findByEmail(email);
  }

  async create(userData) {
    // Add any business logic/validation here before creating the user
    return this.repository.create(userData);
  }

  async update(rut, userData) {
    // Add any business logic/validation here before updating
    return this.repository.update(rut, userData);
  }
}
