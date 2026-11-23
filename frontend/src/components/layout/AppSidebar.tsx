import type { LucideIcon } from "lucide-react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  LayoutDashboard,
  Package,
  Users,
  Warehouse,
} from "lucide-react"
import { NavLink, useMatch } from "react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { t } from "@/i18n/de"

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: t.common.nav.dashboard, icon: LayoutDashboard },
  { to: "/artikel", label: t.common.nav.products, icon: Package },
  { to: "/kunden", label: t.common.nav.customers, icon: Users },
  { to: "/wareneingang", label: t.common.nav.inbound, icon: ArrowDownToLine },
  { to: "/warenausgang", label: t.common.nav.outbound, icon: ArrowUpFromLine },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Warehouse className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{t.common.appName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t.common.appSubtitle}
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.common.nav.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <NavMenuItem key={item.to} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

/** Highlighted for its own path and all sub-paths (e.g. /artikel/neu), the dashboard only for "/". */
function NavMenuItem({ item }: { item: NavItem }) {
  const isActive = useMatch({ path: item.to, end: item.to === "/" }) !== null
  const Icon = item.icon

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <NavLink to={item.to}>
          <Icon />
          <span>{item.label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
