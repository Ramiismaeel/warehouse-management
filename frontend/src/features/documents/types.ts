import type { ProductUnit } from "@/features/products/types"

/** Status of a Beleg (Wareneingang or Warenausgang). Mirrors the backend enum DocumentStatus. */
export type DocumentStatus = "DRAFT" | "CONFIRMED" | "CANCELLED"

/** Which way a Beleg moves stock: Wareneingang IN (+), Warenausgang OUT (−). */
export type StockDirection = "IN" | "OUT"

/** One position in a create/update request. Mirrors InboundDeliveryItemRequest and OutboundOrderItemRequest. */
export interface DocumentItemRequest {
  productId: number
  /** Always ≥ 1 (business rule 2). The direction decides the sign. */
  quantity: number
}

/** One position of a Beleg. Mirrors InboundDeliveryItemResponse and OutboundOrderItemResponse. */
export interface DocumentItem {
  productId: number
  sku: string
  name: string
  quantity: number
  unit: ProductUnit
}
