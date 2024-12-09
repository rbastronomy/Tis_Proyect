import { AuthError } from '../auth/auth.js';
import authInstance from '../auth/auth.js';
import * as argon2 from 'argon2';

export class AuthService {
  constructor(userService) {
    this.userService = userService;
    this.auth = authInstance;
  }

  /**
   * Hashes a password using argon2
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   * @private
   */
  async _hashPassword(password) {
    return await argon2.hash(password);
  }

  /**
   * Validates a password against its hash
   * @param {string} hashedPassword - Stored hashed password
   * @param {string} password - Plain text password to validate
   * @returns {Promise<boolean>} Whether password is valid
   * @private
   */
  async _validatePassword(hashedPassword, password) {
    try {
      if (!hashedPassword || !password) {
        console.error('Missing password or hash for validation');
        return false;
      }
      return await argon2.verify(hashedPassword, password);
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  }

  /**
   * Registers a new user with authentication
   * @param {Object} userData - User registration data
   * @returns {Promise<{user: UserModel, session: Session}>}
   * @throws {AuthError} When user already exists or registration fails
   */
  async register(userData) {
    try {
      // Check if user exists
      const existingUser = await this.userService.getByEmail(userData.correo);
      if (existingUser) {
        throw AuthError.UserExists();
      }

      // Hash password before user creation
      const hashedPassword = await this._hashPassword(userData.contrasena);
      
      // Create user with hashed password
      const user = await this.userService.create({
        ...userData,
        contrasena: hashedPassword
      });

      console.log('User created:', user);
      // Create auth session
      const session = await this.auth.createSession(user.rut.toString());

      return { user, session };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof AuthError) throw error;
      throw AuthError.DatabaseError('Registration failed');
    }
  }

  /**
   * Authenticates a user and creates a session
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: UserModel, session: Session}>}
   * @throws {AuthError} When credentials are invalid
   */
  async login(correo, contrasena) {
    try {
      // Use userService to get user data
      const user = await this.userService.getUserWithAuth(correo);
      if (!user) {
        throw AuthError.UserNotFound();
      }

      // Get password using the getter from UserModel
      const hashedPassword = user._data.contrasena; // Access internal data directly since there's no getter

      // Validate password
      const isValidPassword = await this._validatePassword(
        hashedPassword,
        contrasena
      );

      if (!isValidPassword) {
        throw AuthError.InvalidCredentials();
      }

      // Create new session
      const session = await this.auth.createSession(user.rut.toString());

      //log successful login
      console.log('Login successful for user:', correo);
      return { user, session };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof AuthError) throw error;
      throw AuthError.DatabaseError('Login failed');
    }
  }

  /**
   * Invalidates a user session
   * @param {string} sessionId - Session ID to invalidate
   * @returns {Promise<void>}
   * @throws {AuthError} When session invalidation fails
   */
  async logout(sessionId) {
    try {
      if (!sessionId) {
        throw AuthError.InvalidSession();
      }

      await this.auth.invalidateSession(sessionId);
    } catch (error) {
      console.error('Logout error:', error);
      if (error instanceof AuthError) throw error;
      throw AuthError.DatabaseError('Logout failed');
    }
  }

  /**
   * Validates a session and returns the associated user
   * @param {string} sessionId - Session ID to validate
   * @returns {Promise<{session: Session, user: UserModel}>}
   * @throws {AuthError} When session is invalid
   */
  async validateSession(sessionId) {
    try {
      if (!sessionId) {
        throw AuthError.InvalidSession();
      }

      // First verify the session
      const { session, user } = await this.auth.verifySession(sessionId);
      
      if (!user || !user.correo) {
        throw AuthError.InvalidSession('Invalid user data in session');
      }

      // Check if userService is available
      if (!this.userService) {
        console.error('UserService not initialized in AuthService');
        throw AuthError.DatabaseError('Service configuration error');
      }

      try {
        // Get full user details including roles and permissions
        console.log('Validating session for user:', user.correo);
        const fullUser = await this.userService.getUserWithAuth(user.correo);
        
        if (!fullUser) {
          throw AuthError.UserNotFound();
        }

        return { session, user: fullUser };
      } catch (error) {
        console.error('Error fetching user details:', error);
        throw AuthError.DatabaseError('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Session validation error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw AuthError.InvalidSession('Session validation failed');
    }
  }

  /**
   * Invalidates all sessions for a user
   * @param {string} userId - User ID whose sessions should be invalidated
   * @returns {Promise<void>}
   * @throws {AuthError} When session invalidation fails
   */
  async invalidateAllSessions(userId) {
    try {
      await this.auth.invalidateAllSessions(userId);
    } catch {
      throw AuthError.DatabaseError('Failed to invalidate all sessions');
    }
  }

  async createSession(user) {
    try {
      if (!user || !user.rut) {
        throw new AuthError("Invalid user data", "INVALID_USER_DATA");
      }
      const session = await this.auth.createSession(user.rut.toString());
      return session;
    } catch (error) {
      console.error('Session creation error:', error);
      throw new AuthError(
        error.message || "Failed to create session",
        "SESSION_CREATION_FAILED"
      );
    }
  }
} 