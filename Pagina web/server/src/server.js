import { TripRouter } from './routes/TripRouter.js';

// In setupRoutes() or similar initialization function
const setupRoutes = (server) => {
    // ... other routers ...
    new TripRouter(server);
}; 