import { apiClient } from "@/api/client"
import type { OutboundOrderDetail, OutboundOrderSummary } from "@/features/outbound/types"

const BASE = "/outbound-orders"

/** All Warenausgänge. Filtering by status happens client-side. */
export async function fetchOutboundOrders(): Promise<OutboundOrderSummary[]> {
  const { data } = await apiClient.get<OutboundOrderSummary[]>(BASE)
  return data
}

/** 404 when no Warenausgang has this id. */
export async function fetchOutboundOrder(id: number): Promise<OutboundOrderDetail> {
  const { data } = await apiClient.get<OutboundOrderDetail>(`${BASE}/${id}`)
  return data
}

/** DRAFT → CONFIRMED, stock −. 409 with `shortages` when stock would go negative (business rule 3). */
export async function confirmOutboundOrder(id: number): Promise<OutboundOrderDetail> {
  const { data } = await apiClient.post<OutboundOrderDetail>(`${BASE}/${id}/confirm`)
  return data
}

/** CONFIRMED → CANCELLED, stock +. 409 when the status is not CONFIRMED. */
export async function cancelOutboundOrder(id: number): Promise<OutboundOrderDetail> {
  const { data } = await apiClient.post<OutboundOrderDetail>(`${BASE}/${id}/cancel`)
  return data
}

/** Only drafts. 409 when the status is not DRAFT. */
export async function deleteOutboundOrder(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`)
}
