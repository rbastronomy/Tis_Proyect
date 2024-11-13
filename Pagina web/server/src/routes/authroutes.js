import { AuthController } from '../controllers/AuthController.js';
const authController = new AuthController();

export default async function authRoutes(fastify, options) {
  fastify.post('/login', authController.login.bind(authController));
  fastify.post('/register', authController.register.bind(authController));
  fastify.post('/logout', authController.logout.bind(authController));
  fastify.get('/validate-session', authController.validateSession.bind(authController));
}