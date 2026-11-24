import type { DocumentItem, DocumentStatus } from "@/features/documents/types"

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
