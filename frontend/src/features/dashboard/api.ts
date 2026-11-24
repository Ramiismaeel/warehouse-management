import { apiClient } from "@/api/client"
import type { Dashboard } from "@/features/dashboard/types"

export async function fetchDashboard(): Promise<Dashboard> {
  const { data } = await apiClient.get<Dashboard>("/dashboard")
  return data
}
