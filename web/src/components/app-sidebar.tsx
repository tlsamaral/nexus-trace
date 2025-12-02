"use client"

import * as React from "react"
import {
  IconDashboard,
  IconCurrencyDollar,
  IconUsers,
  IconSettings,
  IconBolt,
  IconWallet,
  IconHelp,
  IconSearch,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { FlaskConical } from "lucide-react"

const data = {
  user: {
    name: "Administrador",
    email: "admin@nexostrace.com",
    avatar: "",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Transações",
      url: "/transactions",
      icon: IconCurrencyDollar,
    },
    {
      title: "Contas",
      url: "/accounts",
      icon: IconWallet,
    },
    {
      title: "Comunidades",
      url: "/communities",
      icon: IconUsers,
    },
    {
      title: "Regras & Modelos",
      url: "/rules",
      icon: IconBolt,
    },
    {
      title: "Simulador de Fraudes",
      url: "/test-fraud",
      icon: FlaskConical,
    },
  ],

  navSecondary: [
    {
      title: "Configurações",
      url: "/rules",
      icon: IconSettings,
    },
    {
      title: "Buscar",
      url: "/search",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>

      {/* 👉 Logo + nome */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <span className="text-base font-semibold">NexusTrace</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>


      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>


      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
