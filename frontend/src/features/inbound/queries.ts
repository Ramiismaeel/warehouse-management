import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"

import { dashboardKeys } from "@/features/dashboard/queries"
import {
  cancelInboundDelivery,
  confirmInboundDelivery,
  createInboundDelivery,
  deleteInboundDelivery,
  fetchInboundDeliveries,
  fetchInboundDelivery,
  updateInboundDelivery,
} from "@/features/inbound/api"
import type { InboundDeliveryDetail, InboundDeliveryRequest } from "@/features/inbound/types"
import { productKeys } from "@/features/products/queries"
import { isValidId } from "@/lib/ids"

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
    enabled: isValidId(id),
  })
}

export function useCreateInboundDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInboundDelivery,
    onSuccess: (delivery) => storeSavedDraft(queryClient, delivery),
  })
}

export function useUpdateInboundDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: InboundDeliveryRequest }) =>
      updateInboundDelivery(id, request),
    onSuccess: (delivery) => storeSavedDraft(queryClient, delivery),
    onError: (_error, { id }) => refreshAfterFailure(queryClient, id),
  })
}

export function useConfirmInboundDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmInboundDelivery,
    onSuccess: (delivery) => storeStockChange(queryClient, delivery),
    onError: (_error, id) => refreshAfterFailure(queryClient, id),
  })
}

export function useCancelInboundDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelInboundDelivery,
    onSuccess: (delivery) => storeStockChange(queryClient, delivery),
    // A 409 with shortages means our Bestand numbers are outdated too: reload them as well.
    onError: (error, id) =>
      Promise.all([
        refreshAfterFailure(queryClient, id),
        error.shortages.length > 0
          ? queryClient.invalidateQueries({ queryKey: productKeys.all })
          : undefined,
      ]),
  })
}

export function useDeleteInboundDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInboundDelivery,
    // Not the detail: the detail page of the deleted draft is still open until it navigates away,
    // and removing its query would refetch it and flash a 404. A draft has no stock effect,
    // but the dashboard counts open drafts.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: inboundKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]),
    onError: (_error, id) => refreshAfterFailure(queryClient, id),
  })
}

/**
 * A saved draft has no stock effect: only the Wareneingang list and the dashboard
 * (recent documents) are outdated. The detail page gets the saved data directly.
 */
function storeSavedDraft(queryClient: QueryClient, delivery: InboundDeliveryDetail) {
  queryClient.setQueryData(inboundKeys.detail(delivery.id), delivery)
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: inboundKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  ])
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

/**
 * A failed action often means our copy is outdated, e.g. a 409 because the Wareneingang was
 * confirmed or deleted in another tab. Reload it, so the page shows its real status and buttons.
 */
function refreshAfterFailure(queryClient: QueryClient, id: number) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: inboundKeys.detail(id) }),
    queryClient.invalidateQueries({ queryKey: inboundKeys.lists() }),
  ])
}
