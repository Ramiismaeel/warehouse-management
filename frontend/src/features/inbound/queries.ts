import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"

import { dashboardKeys } from "@/features/dashboard/queries"
import {
  cancelInboundDelivery,
  confirmInboundDelivery,
  deleteInboundDelivery,
  fetchInboundDeliveries,
  fetchInboundDelivery,
} from "@/features/inbound/api"
import type { InboundDeliveryDetail } from "@/features/inbound/types"
import { productKeys } from "@/features/products/queries"

export const inboundKeys = {
  all: ["inbound-deliveries"] as const,
  lists: () => [...inboundKeys.all, "list"] as const,
  list: () => [...inboundKeys.lists()] as const,
  detail: (id: number) => [...inboundKeys.all, "detail", id] as const,
}

/** All Wareneingänge. Status filter, search, sorting and paging happen client-side. */
export function useInboundDeliveries() {
  return useQuery({
    queryKey: inboundKeys.list(),
    queryFn: fetchInboundDeliveries,
  })
}

/** One Wareneingang with its items. Doesn't fetch for an invalid id (e.g. /wareneingang/abc). */
export function useInboundDelivery(id: number) {
  return useQuery({
    queryKey: inboundKeys.detail(id),
    queryFn: () => fetchInboundDelivery(id),
    enabled: isValidInboundDeliveryId(id),
  })
}

export function useConfirmInboundDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmInboundDelivery,
    onSuccess: (delivery) => storeStockChange(queryClient, delivery),
  })
}

export function useCancelInboundDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelInboundDelivery,
    onSuccess: (delivery) => storeStockChange(queryClient, delivery),
  })
}

export function useDeleteInboundDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInboundDelivery,
    // Only the list: the detail page of the deleted draft is still open until it navigates away,
    // and removing its query would refetch it and flash a 404. A draft has no stock effect.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inboundKeys.lists() }),
  })
}

export function isValidInboundDeliveryId(id: number): boolean {
  return Number.isInteger(id) && id > 0
}

/**
 * Confirm and cancel change stock, so besides the Wareneingang itself the Artikel (Bestand)
 * and the dashboard (low stock, recent documents) are outdated too.
 */
function storeStockChange(queryClient: QueryClient, delivery: InboundDeliveryDetail) {
  queryClient.setQueryData(inboundKeys.detail(delivery.id), delivery)
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: inboundKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: productKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  ])
}
