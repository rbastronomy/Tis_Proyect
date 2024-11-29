export class AuthService {
  constructor(userService) {
    this.userService = userService;
    this.auth = auth; // auth singleton
  }

  /**
   * Registers a new user with authentication
   * @param {Object} userData - User registration data
   * @returns {Promise<{user: UserModel, session: Session}>}
   */
  async register(userData) {
    try {
      // 1. Verify if user exists
      const existingUser = await this.userService.getByEmail(userData.correo);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // 2. Create user in database through UserService
      const user = await this.userService.create(userData);

      // 4. Create session
      const session = await this.auth.createSession({
        userId: authUser.userId,
        attributes: {}
      });

      return { user, session };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handles user login
   * @param {string} identifier - Email
   * @param {string} password - Password
   */
  async login(identifier, password) {
    const key = await this.auth.useKey("email", identifier, password);
    const user = await this.userService.getUserWithAuth(key.userId);
    const session = await this.auth.createSession({
      userId: key.userId,
      attributes: {}
    });
    return { user, session };
  }

  async logout(sessionId) {
    await this.auth.invalidateSession(sessionId);
  }

  async validateSession(sessionId) {
    return await this.auth.validateSession(sessionId);
  }
} 