import { apiClient } from "@/api/client"
import type { Product, ProductRequest } from "@/features/products/types"

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/products")
  return data
}

/** 404 when no product has this id. */
export async function fetchProduct(id: number): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`)
  return data
}

/** 400 with `errors` on invalid fields, 409 with `errors.sku` when the SKU is taken. */
export async function createProduct(request: ProductRequest): Promise<Product> {
  const { data } = await apiClient.post<Product>("/products", request)
  return data
}

/** Same errors as createProduct, plus 404 when the product no longer exists. */
export async function updateProduct(id: number, request: ProductRequest): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/products/${id}`, request)
  return data
}

/** 409 when the product is used in a Beleg (business rule 7). */
export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}
