/** Mirrors backend enum ProductUnit. */
export type ProductUnit = "PIECE" | "KILOGRAM" | "LITER" | "METER" | "BOX"

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
