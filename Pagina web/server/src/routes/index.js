import { AuthRouter } from './AuthRouter.js';
import { UserRouter } from './UserRouter.js';
import { RoleRouter } from './RoleRouter.js';
import { PermissionRouter } from './PermissionRouter.js';
import { MapRouter } from './MapRouter.js';
import { BookingRouter } from './BookingRouter.js';
import { ServiceRouter } from './ServiceRouter.js';
import { OfferingRouter } from './OfferingRouter.js';
import { ExampleRouter } from './ExampleRouter.js';

export const setupRoutes = (fastify) => {
  new AuthRouter(fastify);
  new UserRouter(fastify);
  new RoleRouter(fastify);
  new PermissionRouter(fastify);
  new MapRouter(fastify);
  new BookingRouter(fastify);
  new ServiceRouter(fastify);
  new OfferingRouter(fastify);
  new ExampleRouter(fastify);
};
