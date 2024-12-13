import { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft } from 'lucide-react';
import PropTypes from 'prop-types';

const SidebarContext = createContext({});

export function SidebarProvider({ children, ...props }) {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }} {...props}>
      {children}
    </SidebarContext.Provider>
  );
}

SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function Sidebar({ className, children, ...props }) {
  const { collapsed } = useContext(SidebarContext);
  
  return (
    <aside
      className={cn(
        'flex flex-col transition-all duration-300 relative h-full',
        collapsed ? 'w-0 overflow-hidden' : 'w-[260px]',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

Sidebar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function SidebarContent({ className, children, ...props }) {
  return (
    <div className={cn('h-full overflow-auto py-2', className)} {...props}>
      {children}
    </div>
  );
}

SidebarContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function SidebarMenu({ className, children, ...props }) {
  return (
    <nav className={cn('h-full space-y-4', className)} {...props}>
      {children}
    </nav>
  );
}

SidebarMenu.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function SidebarGroup({ className, children, ...props }) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {children}
    </div>
  );
}

SidebarGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function SidebarGroupLabel({ className, children, ...props }) {
  const { collapsed } = useContext(SidebarContext);
  if (collapsed) return null;
  
  return (
    <h3 className={cn('text-xs font-medium', className)} {...props}>
      {children}
    </h3>
  );
}

SidebarGroupLabel.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export function SidebarGroupContent({ className, children, ...props }) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {children}
    </div>
  );
}

SidebarGroupContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function SidebarInset({ className, children, ...props }) {
  return (
    <div className={cn('flex-1 overflow-hidden', className)} {...props}>
      {children}
    </div>
  );
}

SidebarInset.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function SidebarTrigger({ className, ...props }) {
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className={cn(
        'z-40 h-6 w-6 rounded-full bg-background border shadow-md flex items-center justify-center hover:bg-muted transition-colors absolute top-6',
        collapsed ? 'left-1' : 'left-[calc(260px-1.5rem)]',
        className
      )}
      {...props}
    >
      <ChevronLeft className={cn(
        'h-4 w-4 transition-transform',
        collapsed ? 'rotate-180' : ''
      )} />
    </button>
  );
}

SidebarTrigger.propTypes = {
  className: PropTypes.string,
}; 