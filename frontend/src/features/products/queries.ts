import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"

import {
  createProduct,
  deleteProduct,
  fetchProduct,
  fetchProducts,
  updateProduct,
} from "@/features/products/api"
import type { Product, ProductRequest } from "@/features/products/types"

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

/** One product. Doesn't fetch for an invalid id (e.g. /artikel/abc/bearbeiten). */
export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: isValidProductId(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => storeSavedProduct(queryClient, product),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: ProductRequest }) =>
      updateProduct(id, request),
    onSuccess: (product) => storeSavedProduct(queryClient, product),
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

export function isValidProductId(id: number): boolean {
  return Number.isInteger(id) && id > 0
}

/** Caches the saved product for its edit page and marks the list as outdated. */
function storeSavedProduct(queryClient: QueryClient, product: Product) {
  queryClient.setQueryData(productKeys.detail(product.id), product)
  return queryClient.invalidateQueries({ queryKey: productKeys.lists() })
}
