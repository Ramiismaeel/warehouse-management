import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { deleteProduct, fetchProducts } from "@/features/products/api"

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: () => [...productKeys.lists()] as const,
  detail: (id: number) => [...productKeys.all, "detail", id] as const,
}

/** All products. Search, sorting and paging happen client-side in DataTable. */
export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: fetchProducts,
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    // Returning the promise keeps the mutation pending until the list is refetched,
    // so the deleted row is gone when the dialog closes.
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(id) })
      return queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
