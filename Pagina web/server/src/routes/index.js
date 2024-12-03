import { AuthRouter } from './AuthRouter.js';
import { UserRouter } from './UserRouter.js';
import { RoleRouter } from './RoleRouter.js';
import { PermissionRouter } from './PermissionRouter.js';
import { MapRouter } from './MapRouter.js';
import { TaxiBookingRouter } from './TaxiBookingRouter.js';

export function setupRoutes(fastify) {
  // Initialize and register all routers
  const routers = [
    new AuthRouter(fastify),
    new UserRouter(fastify),
    new RoleRouter(fastify),
    new PermissionRouter(fastify),
    new MapRouter(fastify),
    new TaxiBookingRouter(fastify)
  ];

  // Register all routes
  routers.forEach(router => router.registerRoutes());
}
