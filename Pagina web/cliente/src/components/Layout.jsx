import React from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@nextui-org/react";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar isBordered>
        <NavbarBrand>
          <Link to="/" className="text-xl font-bold text-gray-800">
            My App
          </Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link to="/" className="text-gray-900 text-sm font-medium">
              Home
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link to="/login" className="text-gray-900 text-sm font-medium">
              Login
            </Link>
          </NavbarItem>
          {/* Add more navigation items here */}
        </NavbarContent>
      </Navbar>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
