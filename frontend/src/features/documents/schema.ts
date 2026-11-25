import { z } from "zod"

import type { DocumentItem } from "@/features/documents/types"
import { t } from "@/i18n/de"
import { MAX_QUANTITY } from "@/lib/stock"

const messages = t.documents.validation

/** One position. The form holds productId null until a product is picked; the output is a DocumentItemRequest. */
export const documentItemSchema = z.object({
  productId: z
    .number()
    .nullable()
    .transform((productId, ctx) => {
      if (productId === null) {
        ctx.addIssue({ code: "custom", message: messages.productRequired })
        return z.NEVER
      }
      return productId
    }),
  // The input uses valueAsNumber, so an empty field arrives as NaN and fails here.
  quantity: z
    .number({ error: messages.quantityRequired })
    .int(messages.quantityInteger)
    .min(1, messages.quantityMin)
    .max(MAX_QUANTITY, messages.quantityMax),
})

/**
 * The `items` field of a Wareneingang or Warenausgang form (business rule 6):
 * at least one position, each product at most once.
 *
 * @example
 * const inboundFormSchema = z.object({ supplierName: ..., items: documentItemsSchema })
 */
export const documentItemsSchema = z
  .array(documentItemSchema)
  .min(1, messages.itemsMin)
  .superRefine((items, ctx) => {
    // ProductPicker already prevents duplicates; this is the safety net for the request.
    const seen = new Set<number>()
    items.forEach((item, index) => {
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: "custom",
          message: messages.duplicateProduct,
          path: [index, "productId"],
        })
      }
      seen.add(item.productId)
    })
  })

/** What one position row holds in the form. */
export type DocumentItemFormValues = z.input<typeof documentItemSchema>

/** A form that contains DocumentItemsEditor must have this field. */
export interface DocumentItemsFormValues {
  items: DocumentItemFormValues[]
}

export const EMPTY_DOCUMENT_ITEM: DocumentItemFormValues = { productId: null, quantity: 1 }

/** For edit forms: the loaded Beleg's positions as form rows. */
export function toDocumentItemFormValues(items: DocumentItem[]): DocumentItemFormValues[] {
  return items.map(({ productId, quantity }) => ({ productId, quantity }))
}
