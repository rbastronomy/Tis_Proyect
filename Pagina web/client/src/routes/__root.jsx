import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Layout from '../components/Layout'; // Import the Layout component

export const Route = createRootRoute({
  component: () => (
    <>
      <TanStackRouterDevtools />
      <Layout> {/* Wrap Outlet with Layout */}
        <Outlet />
      </Layout>
    </>
  ),
})
