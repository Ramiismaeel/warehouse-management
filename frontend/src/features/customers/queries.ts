import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"

import {
  createCustomer,
  deleteCustomer,
  fetchCustomer,
  fetchCustomers,
  updateCustomer,
} from "@/features/customers/api"
import type { Customer, CustomerRequest } from "@/features/customers/types"

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: () => [...customerKeys.lists()] as const,
  detail: (id: number) => [...customerKeys.all, "detail", id] as const,
}

/** All customers. Search, sorting and paging happen client-side in DataTable. */
export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.list(),
    queryFn: fetchCustomers,
  })
}

/** One customer. Doesn't fetch for an invalid id (e.g. /kunden/abc/bearbeiten). */
export function useCustomer(id: number) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => fetchCustomer(id),
    enabled: isValidCustomerId(id),
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: (customer) => storeSavedCustomer(queryClient, customer),
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: CustomerRequest }) =>
      updateCustomer(id, request),
    onSuccess: (customer) => storeSavedCustomer(queryClient, customer),
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCustomer,
    // Returning the promise keeps the mutation pending until the list is refetched,
    // so the deleted row is gone when the dialog closes.
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) })
      return queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

export function isValidCustomerId(id: number): boolean {
  return Number.isInteger(id) && id > 0
}

/** Caches the saved customer for its edit page and marks the list as outdated. */
function storeSavedCustomer(queryClient: QueryClient, customer: Customer) {
  queryClient.setQueryData(customerKeys.detail(customer.id), customer)
  return queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
}
