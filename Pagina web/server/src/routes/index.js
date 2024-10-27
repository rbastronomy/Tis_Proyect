import { BaseController } from '../core/BaseController.js';
import { handleRequest } from "../auth/lucia.js";
import { AuthController } from '../controllers/AuthController.js';

class TestController extends BaseController {
  constructor() {
    super();
  }

  async getHello() {
    return { hello: 'world' };
  }

  async postExample(request) {
    const { name } = request.body;
    return { message: `Hello, ${name}!` };
  }

  async getProtected(request, reply) {
    const authRequest = handleRequest(request, reply);
    const session = await authRequest.validate();
    if (!session) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    return { message: 'This is a protected route', userId: session.user.userId };
  }
}

export function setupRoutes(fastify) {
  const testController = new TestController();
  const authController = new AuthController();

  // Public routes
  fastify.get('/', testController.getHello);
  fastify.post('/example', testController.postExample);

  // Auth routes
  fastify.post('/login', authController.login.bind(authController));
  fastify.post('/logout', authController.logout.bind(authController));
  fastify.get('/validate-session', authController.validateSession.bind(authController));
  fastify.post('/register', authController.register.bind(authController)); // New registration route

  // Protected route
  fastify.get('/protected', testController.getProtected);

  // Add more routes as needed
}
