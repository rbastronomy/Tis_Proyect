import { createRouter } from '@tanstack/react-router';
import { Route as RootRoute } from './routes/__root';
import { Route as AyudaRoute } from './routes/ayuda.lazy';
import { Route as LoginRoute } from './routes/login.lazy';
import { Route as SobreRoute } from './routes/sobre.lazy';
import { Route as ContactoRoute } from './routes/contacto.lazy';
import { Route as AdminDashboardRoute } from './routes/admin/dashboard.lazy';
import { Route as ReservasRoute } from './routes/reservas/index.lazy';
import { Route as ReservaDetailRoute } from './routes/reservas/$codigoReserva.lazy';

const routeTree = RootRoute.addChildren([
  AyudaRoute,
  LoginRoute,
  SobreRoute,
  ContactoRoute,
  AdminDashboardRoute,
  ReservasRoute,
  ReservaDetailRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadDelay: 100,
});