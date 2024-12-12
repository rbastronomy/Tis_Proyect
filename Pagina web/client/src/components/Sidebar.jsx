import { 
  LayoutDashboard, 
  CalendarRange, 
  Receipt, 
  Briefcase, 
  Car, 
  HardHat, 
  Users, 
} from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
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
        url: "/admin/bookings",
      },
      {
        title: "Tarifas",
        icon: Receipt,
        url: "/admin/rates",
      },
    ],
  },
  {
    title: "Servicios",
    items: [
      {
        title: "Servicios",
        icon: Briefcase,
        url: "/admin/services",
      },
      {
        title: "Taxis",
        icon: Car,
        url: "/admin/taxis",
      },
    ],
  },
  {
    title: "Usuarios",
    items: [
      {
        title: "Conductores",
        icon: HardHat,
        url: "/admin/drivers",
      },
      {
        title: "Usuarios",
        icon: Users,
        url: "/admin/users",
      },
    ],
  },
]

export function AdminSidebar() {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

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

