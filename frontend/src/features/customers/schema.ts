import { z } from "zod"

import type { Customer } from "@/features/customers/types"
import { t } from "@/i18n/de"

const messages = t.customers.validation

/** Mirrors the backend's CustomerRequest validation. Its output is a CustomerRequest. */
export const customerFormSchema = z.object({
  name: z.string().trim().min(1, messages.nameRequired).max(255, messages.nameMax),
  email: z
    .string()
    .trim()
    .max(255, messages.emailMax)
    .refine((value) => value === "" || z.email().safeParse(value).success, messages.emailInvalid)
    .transform(emptyToNull),
  phone: z.string().trim().max(50, messages.phoneMax).transform(emptyToNull),
  street: z.string().trim().max(255, messages.streetMax).transform(emptyToNull),
  zipCode: z
    .string()
    .trim()
    .regex(/^(\d{5})?$/, messages.zipCodeInvalid)
    .transform(emptyToNull),
  city: z.string().trim().max(255, messages.cityMax).transform(emptyToNull),
})

/** What the form fields hold (empty strings instead of null). */
export type CustomerFormValues = z.input<typeof customerFormSchema>

export const CUSTOMER_FORM_FIELDS = [
  "name",
  "email",
  "phone",
  "street",
  "zipCode",
  "city",
] as const satisfies readonly (keyof CustomerFormValues)[]

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  name: "",
  email: "",
  phone: "",
  street: "",
  zipCode: "",
  city: "",
}

export function toCustomerFormValues(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    street: customer.street ?? "",
    zipCode: customer.zipCode ?? "",
    city: customer.city ?? "",
  }
}

function emptyToNull(value: string): string | null {
  return value === "" ? null : value
}
