import { z } from "zod"

import { PRODUCT_UNITS, type Product } from "@/features/products/types"
import { t } from "@/i18n/de"

const messages = t.products.validation

/** Mirrors the backend's ProductRequest validation. Its output is a ProductRequest. */
export const productFormSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, messages.skuRequired)
    .min(2, messages.skuLength)
    .max(50, messages.skuLength),
  name: z
    .string()
    .trim()
    .min(1, messages.nameRequired)
    .min(3, messages.nameLength)
    .max(255, messages.nameLength),
  description: z.string().trim().max(255, messages.descriptionMax).transform(emptyToNull),
  unit: z.enum(PRODUCT_UNITS, { error: messages.unitRequired }),
  // The input uses valueAsNumber, so an empty field arrives as NaN and fails here.
  minQuantity: z
    .number({ error: messages.minQuantityRequired })
    .int(messages.minQuantityInteger)
    .min(0, messages.minQuantityMin),
  imageUrl: z
    .string()
    .trim()
    .max(500, messages.imageUrlMax)
    .refine((value) => value === "" || isHttpUrl(value), messages.imageUrlInvalid)
    .transform(emptyToNull),
})

/** What the form fields hold (empty strings instead of null). */
export type ProductFormValues = z.input<typeof productFormSchema>

export const PRODUCT_FORM_FIELDS = [
  "sku",
  "name",
  "description",
  "unit",
  "minQuantity",
  "imageUrl",
] as const satisfies readonly (keyof ProductFormValues)[]

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  sku: "",
  name: "",
  description: "",
  unit: "PIECE",
  minQuantity: 0,
  imageUrl: "",
}

export function toProductFormValues(product: Product): ProductFormValues {
  return {
    sku: product.sku,
    name: product.name,
    description: product.description ?? "",
    unit: product.unit,
    minQuantity: product.minQuantity,
    imageUrl: product.imageUrl ?? "",
  }
}

/** Only http(s) links can be shown as an image. */
export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === "http:" || protocol === "https:"
  } catch {
    return false
  }
}

function emptyToNull(value: string): string | null {
  return value === "" ? null : value
}
