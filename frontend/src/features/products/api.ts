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

/** URL of an Unsplash photo that fits the name, or null (no match, no key, or Unsplash unreachable). */
export async function fetchUnsplashImageUrl(name: string): Promise<string | null> {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined
  // Sizes like "M6", "200 mm" or "Gr. 43" make the search worse.
  const query = name.replace(/\S*\d\S*|\b(mm|cm|kg)\b|\bGr\./gi, "").trim()
  if (!accessKey || !query) {
    return null
  }
  const params = new URLSearchParams({ query, lang: "de", per_page: "1", client_id: accessKey })
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?${params}`)
    const data = (await response.json()) as { results?: { urls: { small: string } }[] }
    return data.results?.[0]?.urls.small ?? null
  } catch {
    return null
  }
}
