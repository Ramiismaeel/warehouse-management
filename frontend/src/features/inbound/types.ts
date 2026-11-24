import type { DocumentItem, DocumentItemRequest, DocumentStatus } from "@/features/documents/types"

/** Mirrors backend InboundDeliveryRequest (create and update draft). */
export interface InboundDeliveryRequest {
  supplierName: string
  /** ISO date. The backend uses today when it is null. */
  deliveryDate: string | null
  note: string | null
  /** At least one; a product at most once (business rule 6). */
  items: DocumentItemRequest[]
}

/** One row of the Wareneingang list. Mirrors backend InboundDeliverySummaryResponse. */
export interface InboundDeliverySummary {
  id: number
  /** E.g. "WE-2026-0007". Users see this, not the id (business rule 9). */
  number: string
  /** Lieferant (free text). */
  supplierName: string
  /** ISO date (yyyy-MM-dd). */
  deliveryDate: string | null
  status: DocumentStatus
  itemCount: number
  /** Sum of all item quantities. */
  totalQuantity: number
}

/** Mirrors backend InboundDeliveryDetailResponse. */
export interface InboundDeliveryDetail extends InboundDeliverySummary {
  note: string | null
  items: DocumentItem[]
}
