import { Outlet } from '@tanstack/react-router';
import Navbar from './Navbar';

function Layout() {
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
