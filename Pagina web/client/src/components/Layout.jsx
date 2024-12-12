import { Outlet } from '@tanstack/react-router';
import Navbar from './Navbar';
import { useLocation } from '@tanstack/react-router';

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className={`flex-grow ${isAdminRoute ? 'p-0' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
