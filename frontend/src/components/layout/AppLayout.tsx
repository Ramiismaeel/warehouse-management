import { Outlet } from "react-router"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { t } from "@/i18n/de"

/** Shell of every page: sidebar on the left, the current route on the right. */
export function AppLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" aria-label={t.common.actions.toggleSidebar} />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium">{t.common.appName}</span>
          </header>
          <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
