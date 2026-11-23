import { apiClient } from "@/api/client"
import type { Product } from "@/features/products/types"

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/products")
  return data
}

/** 409 when the product is used in a Beleg (business rule 7). */
export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}
