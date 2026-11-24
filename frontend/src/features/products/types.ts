/** Mirrors backend enum ProductUnit, in the order the form's select shows them. */
export const PRODUCT_UNITS = ["PIECE", "KILOGRAM", "LITER", "METER", "BOX"] as const

export type ProductUnit = (typeof PRODUCT_UNITS)[number]

/** Mirrors backend ProductResponse. */
export interface Product {
  id: number
  sku: string
  name: string
  description: string | null
  unit: ProductUnit
  /** Bestand. Changed only by confirming/cancelling documents, never by product create/update. */
  quantity: number
  /** Mindestbestand. */
  minQuantity: number
  imageUrl: string | null
  lowStock: boolean
  outOfStock: boolean
  version: number
  /** ISO timestamp. */
  createdAt: string
  /** ISO timestamp. */
  updatedAt: string
}

/** Mirrors backend ProductRequest (create and update). Never contains quantity (business rule 1). */
export interface ProductRequest {
  /** The backend trims it and stores it in upper case. */
  sku: string
  name: string
  description: string | null
  unit: ProductUnit
  minQuantity: number
  imageUrl: string | null
}
