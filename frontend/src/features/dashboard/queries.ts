import { useQuery } from "@tanstack/react-query"

import { fetchDashboard } from "@/features/dashboard/api"

/**
 * Query keys of the dashboard. Confirming or cancelling a Beleg, saving or deleting a draft and
 * saving or deleting an Artikel or Kunde invalidate `all`, so the dashboard is fresh after those actions.
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
}

/** KPIs, low-stock products and the newest Belege. Refetched whenever the page is opened. */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: fetchDashboard,
  })
}
