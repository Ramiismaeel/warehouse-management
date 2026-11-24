import { z } from "zod"

import {
  documentItemsSchema,
  EMPTY_DOCUMENT_ITEM,
  toDocumentItemFormValues,
} from "@/features/documents/schema"
import type { InboundDeliveryDetail } from "@/features/inbound/types"
import { t } from "@/i18n/de"
import { toIsoDate } from "@/lib/format"

const messages = t.inbound.validation

/** Mirrors the backend's InboundDeliveryRequest validation. Its output is an InboundDeliveryRequest. */
export const inboundFormSchema = z.object({
  supplierName: z
    .string()
    .trim()
    .min(1, messages.supplierNameRequired)
    .max(255, messages.supplierNameMax),
  // Always sent: the form starts with today instead of relying on the backend's default.
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, messages.deliveryDateRequired),
  note: z
    .string()
    .trim()
    .max(255, messages.noteMax)
    .transform((note) => (note === "" ? null : note)),
  items: documentItemsSchema,
})

/** What the form fields hold. */
export type InboundFormValues = z.input<typeof inboundFormSchema>

export const INBOUND_FORM_FIELDS = [
  "supplierName",
  "deliveryDate",
  "note",
  "items",
] as const satisfies readonly (keyof InboundFormValues)[]

/** A function, not a constant: "today" must be the day the form opens. */
export function emptyInboundForm(): InboundFormValues {
  return {
    supplierName: "",
    deliveryDate: toIsoDate(new Date()),
    note: "",
    items: [EMPTY_DOCUMENT_ITEM],
  }
}

export function toInboundFormValues(delivery: InboundDeliveryDetail): InboundFormValues {
  return {
    supplierName: delivery.supplierName,
    deliveryDate: delivery.deliveryDate ?? toIsoDate(new Date()),
    note: delivery.note ?? "",
    items: toDocumentItemFormValues(delivery.items),
  }
}
