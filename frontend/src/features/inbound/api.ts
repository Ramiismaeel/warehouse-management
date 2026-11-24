import { apiClient } from "@/api/client"
import type {
  InboundDeliveryDetail,
  InboundDeliveryRequest,
  InboundDeliverySummary,
} from "@/features/inbound/types"

const BASE = "/inbound-deliveries"

/** All Wareneingänge. Filtering by status happens client-side. */
export async function fetchInboundDeliveries(): Promise<InboundDeliverySummary[]> {
  const { data } = await apiClient.get<InboundDeliverySummary[]>(BASE)
  return data
}

/** 404 when no Wareneingang has this id. */
export async function fetchInboundDelivery(id: number): Promise<InboundDeliveryDetail> {
  const { data } = await apiClient.get<InboundDeliveryDetail>(`${BASE}/${id}`)
  return data
}

/** Creates a draft (no stock effect). 400 with `errors` on invalid fields, 404 for an unknown product. */
export async function createInboundDelivery(
  request: InboundDeliveryRequest,
): Promise<InboundDeliveryDetail> {
  const { data } = await apiClient.post<InboundDeliveryDetail>(BASE, request)
  return data
}

/** Replaces a draft's data and items. Same errors as create, plus 409 when it is no longer a draft. */
export async function updateInboundDelivery(
  id: number,
  request: InboundDeliveryRequest,
): Promise<InboundDeliveryDetail> {
  const { data } = await apiClient.put<InboundDeliveryDetail>(`${BASE}/${id}`, request)
  return data
}

/** DRAFT → CONFIRMED, stock +. 409 when the status is not DRAFT. */
export async function confirmInboundDelivery(id: number): Promise<InboundDeliveryDetail> {
  const { data } = await apiClient.post<InboundDeliveryDetail>(`${BASE}/${id}/confirm`)
  return data
}

/** CONFIRMED → CANCELLED, stock −. 409 with `shortages` when stock would go negative (business rule 3). */
export async function cancelInboundDelivery(id: number): Promise<InboundDeliveryDetail> {
  const { data } = await apiClient.post<InboundDeliveryDetail>(`${BASE}/${id}/cancel`)
  return data
}

/** Only drafts. 409 when the status is not DRAFT. */
export async function deleteInboundDelivery(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`)
}
