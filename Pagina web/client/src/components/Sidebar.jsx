import { 
  LayoutDashboard, 
  CalendarRange, 
  Receipt, 
  Briefcase, 
  Car, 
  HardHat, 
  Users, 
} from 'lucide-react'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarTrigger,
} from "../components/ui/sidebar"
import { Button } from "@nextui-org/react"
import { useState } from 'react'

const navigation = [
  {
    title: "Principal",
    items: [
      {
        title: "Flota y Reservas",
        icon: LayoutDashboard,
        url: "/admin/dashboard",
      },
      {
        title: "Reservas",
        icon: CalendarRange,
        url: "/admin/reservas",
      },
    ],
  },
  {
    title: "Servicios",
    items: [
      {
        title: "Servicios",
        icon: Briefcase,
        url: "/admin/servicios",
      },
      {
        title: "Tarifas",
        icon: Receipt,
        url: "/admin/tarifas",
      },
    ],
  },
  {
    title: "Flota",
    items: [
      {
        title: "Taxis",
        icon: Car,
        url: "/admin/taxis",
      },
      {
        title: "Conductores",
        icon: HardHat,
        url: "/admin/conductores",
      },
    ],
  },
  {
    title: "Usuarios",
    items: [
      {
        title: "Usuarios",
        icon: Users,
        url: "/admin/usuarios",
      },
    ],
  },
]

export function AdminSidebar() {
  const location = useLocation()
  const router = useRouter()
  const [activeItem, setActiveItem] = useState(location.pathname)

  // Preload route data when hovering over link
  const preloadRoute = (url) => {
    router.preloadRoute({
      to: url,
      params: {},
      search: {}
    })
  }

  return (
    <div className="h-full">
      <Sidebar className="border-r bg-white h-full">
        <SidebarContent>
          <SidebarMenu>
            {navigation.map((group, idx) => (
              <SidebarGroup key={idx}>
                <SidebarGroupLabel className="text-xs font-medium text-gray-500 px-6 py-2">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  {group.items.map((item, index) => (
                    <div className="px-3" key={index}>
                      <Link 
                        to={item.url}
                        className="block"
                        preload="intent" // Enable preloading on hover/touch
                        onMouseEnter={() => preloadRoute(item.url)} // Manually preload on hover
                      >
                        <Button
                          className={`w-full justify-start h-auto py-2.5 px-3 font-medium rounded-lg
                            ${activeItem === item.url 
                              ? 'bg-black text-white [&_svg]:text-white' 
                              : 'bg-transparent text-default-700 [&_svg]:text-default-700'
                            }
                            data-[hover=true]:bg-black data-[hover=true]:text-white [&_svg]:text-white' 
                            [&_svg]:transition-colors data-[hover=true]:[&_svg]:text-white
                            transition-all duration-150
                            !hover:bg-black !hover:text-white`}
                          disableRipple
                          startContent={<item.icon className="h-5 w-5 flex-shrink-0" />}
                          variant="light"
                          onClick={() => setActiveItem(item.url)}
                        >
                          <span className="text-[15px]">{item.title}</span>
                        </Button>
                      </Link>
                    </div>
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger />
    </div>
  )
}

