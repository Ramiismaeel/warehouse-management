import { z } from "zod"

import {
  documentItemsSchema,
  EMPTY_DOCUMENT_ITEM,
  toDocumentItemFormValues,
} from "@/features/documents/schema"
import type { OutboundOrderDetail } from "@/features/outbound/types"
import { t } from "@/i18n/de"
import { toIsoDate } from "@/lib/format"

const messages = t.outbound.validation

/**
 * Mirrors the backend's OutboundOrderRequest validation. Its output is an OutboundOrderRequest.
 * Quantities above the current Bestand are allowed here: drafts may be short, Bestätigen decides (rule 3).
 */
export const outboundFormSchema = z.object({
  // null until a customer is picked.
  customerId: z
    .number()
    .nullable()
    .transform((customerId, ctx) => {
      if (customerId === null) {
        ctx.addIssue({ code: "custom", message: messages.customerRequired })
        return z.NEVER
      }
      return customerId
    }),
  // Always sent: the form starts with today instead of relying on the backend's default.
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, messages.orderDateRequired),
  note: z
    .string()
    .trim()
    .max(255, messages.noteMax)
    .transform((note) => (note === "" ? null : note)),
  items: documentItemsSchema,
})

/** What the form fields hold. */
export type OutboundFormValues = z.input<typeof outboundFormSchema>

export const OUTBOUND_FORM_FIELDS = [
  "customerId",
  "orderDate",
  "note",
  "items",
] as const satisfies readonly (keyof OutboundFormValues)[]

/** A function, not a constant: "today" must be the day the form opens. */
export function emptyOutboundForm(): OutboundFormValues {
  return {
    customerId: null,
    orderDate: toIsoDate(new Date()),
    note: "",
    items: [EMPTY_DOCUMENT_ITEM],
  }
}

export function toOutboundFormValues(order: OutboundOrderDetail): OutboundFormValues {
  return {
    customerId: order.customer.id,
    orderDate: order.orderDate ?? toIsoDate(new Date()),
    note: order.note ?? "",
    items: toDocumentItemFormValues(order.items),
  }
}
