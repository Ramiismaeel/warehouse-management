import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"

import { dashboardKeys } from "@/features/dashboard/queries"
import {
  cancelOutboundOrder,
  confirmOutboundOrder,
  deleteOutboundOrder,
  fetchOutboundOrder,
  fetchOutboundOrders,
} from "@/features/outbound/api"
import type { OutboundOrderDetail } from "@/features/outbound/types"
import { productKeys } from "@/features/products/queries"

export const outboundKeys = {
  all: ["outbound-orders"] as const,
  lists: () => [...outboundKeys.all, "list"] as const,
  list: () => [...outboundKeys.lists()] as const,
  detail: (id: number) => [...outboundKeys.all, "detail", id] as const,
}

/** All Warenausgänge. Status filter, search, sorting and paging happen client-side. */
export function useOutboundOrders() {
  return useQuery({
    queryKey: outboundKeys.list(),
    queryFn: fetchOutboundOrders,
  })
}

/** One Warenausgang with its customer and items. Doesn't fetch for an invalid id. */
export function useOutboundOrder(id: number) {
  return useQuery({
    queryKey: outboundKeys.detail(id),
    queryFn: () => fetchOutboundOrder(id),
    enabled: isValidOutboundOrderId(id),
  })
}

export function useConfirmOutboundOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmOutboundOrder,
    onSuccess: (order) => storeStockChange(queryClient, order),
    // A 409 means our Bestand numbers are outdated: reload them for the draft's stock check.
    onError: (error) => {
      if (error.shortages.length > 0) {
        return queryClient.invalidateQueries({ queryKey: productKeys.all })
      }
    },
  })
}

export function useCancelOutboundOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelOutboundOrder,
    onSuccess: (order) => storeStockChange(queryClient, order),
  })
}

export function useDeleteOutboundOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOutboundOrder,
    // Only the list: the detail page of the deleted draft is still open until it navigates away,
    // and removing its query would refetch it and flash a 404. A draft has no stock effect.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: outboundKeys.lists() }),
  })
}

export function isValidOutboundOrderId(id: number): boolean {
  return Number.isInteger(id) && id > 0
}

/**
 * Confirm and cancel change stock, so besides the Warenausgang itself the Artikel (Bestand)
 * and the dashboard (low stock, recent documents) are outdated too.
 */
function storeStockChange(queryClient: QueryClient, order: OutboundOrderDetail) {
  queryClient.setQueryData(outboundKeys.detail(order.id), order)
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: outboundKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: productKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  ])
}
