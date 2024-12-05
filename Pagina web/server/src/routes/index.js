import { AuthRouter } from './AuthRouter.js';
import { UserRouter } from './UserRouter.js';
import { RoleRouter } from './RoleRouter.js';
import { PermissionRouter } from './PermissionRouter.js';
import { MapRouter } from './MapRouter.js';
import { BookingRouter } from './BookingRouter.js';
import { ServiceRouter } from './ServiceRouter.js';
import { ReservaTarifaRouter } from './ReservaTarifaRouter.js';
import { ServicioTarifaRouter } from './ServicioTarifaRouter.js';
import { SolicitaRouter } from './SolicitaRouter.js';

export function setupRoutes(fastify) {
  // Initialize and register all routers
  const routers = [
    new AuthRouter(fastify),
    new UserRouter(fastify),
    new RoleRouter(fastify),
    new PermissionRouter(fastify),
    new MapRouter(fastify),
    new BookingRouter(fastify),
    new ServiceRouter(fastify),
    new ReservaTarifaRouter(fastify),
    new ServicioTarifaRouter(fastify),
    new SolicitaRouter(fastify)
  ];

  // Register all routes
  routers.forEach(router => router.registerRoutes());
}
