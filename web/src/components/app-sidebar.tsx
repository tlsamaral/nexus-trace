"use client"

import * as React from "react"
import {
  IconDashboard,
  IconCurrencyDollar,
  IconUsers,
  IconSettings,
  IconBolt,
  IconWallet,
  IconChartBar,
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
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
  ],

  navSecondary: [
    {
      title: "Configurações",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Ajuda",
      url: "/help",
      icon: IconHelp,
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
                {/* <img
                  src="/logo.svg"
                  alt="NexosTrace Logo"
                  className="size-6"
                /> */}
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
