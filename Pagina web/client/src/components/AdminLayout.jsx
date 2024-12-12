import PropTypes from 'prop-types';
import { SidebarProvider, SidebarInset } from "../components/ui/sidebar"
import { AdminSidebar } from "./Sidebar"

export function AdminLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <div className="h-screen sticky top-0">
          <AdminSidebar />
        </div>
        <SidebarInset className="flex-1 overflow-auto">
          <main className="p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
}; 