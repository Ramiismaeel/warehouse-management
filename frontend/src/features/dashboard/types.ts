import type { InboundDeliverySummary } from "@/features/inbound/types"
import type { OutboundOrderSummary } from "@/features/outbound/types"
import type { Product } from "@/features/products/types"

/** Mirrors backend DashboardResponse: everything the start page needs in one request. */
export interface Dashboard {
  productCount: number
  customerCount: number
  /** quantity <= minQuantity, includes the empty ones (business rule 8). The KPI card subtracts outOfStockCount. */
  lowStockCount: number
  /** quantity == 0. */
  outOfStockCount: number
  openInboundDrafts: number
  openOutboundDrafts: number
  /** At most 10, lowest Bestand first. */
  lowStockProducts: Product[]
  /** The 5 newest. */
  recentInbound: InboundDeliverySummary[]
  /** The 5 newest. */
  recentOutbound: OutboundOrderSummary[]
}
