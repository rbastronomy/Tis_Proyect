import { createRouter } from '@tanstack/react-router';
import { Route as RootRoute } from './routes/__root';
import { Route as AyudaRoute } from './routes/ayuda.lazy';
import { Route as LoginRoute } from './routes/login.lazy';
import { Route as SobreRoute } from './routes/sobre.lazy';
import { Route as ContactoRoute } from './routes/contacto.lazy';

const routeTree = RootRoute.addChildren([
  AyudaRoute,
  LoginRoute,
  SobreRoute,
  ContactoRoute,
  // Add other routes here
]);

export const router = createRouter({
  routeTree,
}); 