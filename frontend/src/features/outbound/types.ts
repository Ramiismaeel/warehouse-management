import type { Customer } from "@/features/customers/types"
import type { DocumentItem, DocumentItemRequest, DocumentStatus } from "@/features/documents/types"

/** Mirrors backend OutboundOrderRequest (create and update draft). */
export interface OutboundOrderRequest {
  /** Required: a Warenausgang always has a customer (business rule 6). */
  customerId: number
  /** ISO date. The backend uses today when it is null. */
  orderDate: string | null
  note: string | null
  /** At least one; a product at most once (business rule 6). */
  items: DocumentItemRequest[]
}

/** One row of the Warenausgang list. Mirrors backend OutboundOrderSummaryResponse. */
export interface OutboundOrderSummary {
  id: number
  /** E.g. "WA-2026-0003". Users see this, not the id (business rule 9). */
  number: string
  customerName: string
  /** ISO date (yyyy-MM-dd). */
  orderDate: string | null
  status: DocumentStatus
  itemCount: number
  /** Sum of all item quantities. */
  totalQuantity: number
}

/** Mirrors backend OutboundOrderDetailResponse. */
export interface OutboundOrderDetail extends OutboundOrderSummary {
  note: string | null
  /** A Warenausgang always has a customer (business rule 6). */
  customer: Customer
  items: DocumentItem[]
}
