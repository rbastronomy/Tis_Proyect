import { Outlet } from '@tanstack/react-router';
import Navbar from './Navbar';
import { useLocation } from '@tanstack/react-router';
import { SidebarProvider, SidebarInset } from "./ui/sidebar"
import { AdminSidebar } from "./Sidebar"

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <SidebarProvider>
          <div className="flex flex-1">
            <div className="h-[calc(100vh-64px)] sticky top-0">
              <AdminSidebar />
            </div>
            <SidebarInset className="flex-1 overflow-auto">
              <main className="p-6">
                <Outlet />
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
