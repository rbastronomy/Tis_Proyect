import { AuthRouter } from './AuthRouter.js';
import { UserRouter } from './UserRouter.js';
import { RoleRouter } from './RoleRouter.js';
import { PermissionRouter } from './PermissionRouter.js';
import { MapRouter } from './MapRouter.js';
import { BookingRouter } from './BookingRouter.js';
import { ServiceRouter } from './ServiceRouter.js';
import { OfferingRouter } from './OfferingRouter.js';

export function setupRoutes(fastify) {
  const routers = [
    new AuthRouter(fastify),
    new UserRouter(fastify),
    new RoleRouter(fastify),
    new PermissionRouter(fastify),
    new MapRouter(fastify),
    new BookingRouter(fastify),
    new ServiceRouter(fastify),
    new OfferingRouter(fastify),
  ];

  routers.forEach(router => router.registerRoutes());
}
