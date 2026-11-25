import axios from "axios"
import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import { t } from "@/i18n/de"

/** One missing product from a 409 stock conflict (backend property `shortages`). */
export interface Shortage {
  productId: number
  sku: string
  name: string
  requested: number
  available: number
}

/**
 * A failed API call, built from the backend's RFC 9457 ProblemDetail.
 * `detail` is a German, user-readable message that can be shown as-is.
 * `status` is 0 when no response arrived (network error, server down).
 */
export class ApiError extends Error {
  readonly status: number
  readonly title: string
  readonly detail: string
  /** Validation errors (400): field name → message. Empty when not a validation error. */
  readonly errors: Record<string, string>
  /** Stock conflicts (409): every product that is short. Empty otherwise. */
  readonly shortages: Shortage[]

  constructor(init: {
    status: number
    title: string
    detail: string
    errors?: Record<string, string>
    shortages?: Shortage[]
  }) {
    super(init.detail)
    this.name = "ApiError"
    this.status = init.status
    this.title = init.title
    this.detail = init.detail
    this.errors = init.errors ?? {}
    this.shortages = init.shortages ?? []
  }
}

/** Turns anything thrown by an API call into an ApiError. Returns ApiErrors unchanged. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError({
        status: 0,
        title: t.common.errors.networkTitle,
        detail: t.common.errors.network,
      })
    }

    const body: unknown = error.response.data
    const problem = isRecord(body) ? body : {}
    return new ApiError({
      status: error.response.status,
      title: stringOr(problem.title, t.common.errors.title),
      detail: stringOr(problem.detail, t.common.errors.generic),
      errors: parseErrors(problem.errors),
      shortages: parseShortages(problem.shortages),
    })
  }

  return new ApiError({
    status: 0,
    title: t.common.errors.title,
    detail: t.common.errors.generic,
  })
}

/**
 * Puts the backend's field errors (400 validation, 409 duplicate value) on the matching form fields
 * and focuses the first one. Nested keys reach their row, e.g. "items[0].quantity" → items.0.quantity.
 * Returns false when none of them belongs to the form, so the caller can show a toast instead.
 *
 * @example
 * if (!applyFieldErrors(toApiError(error), form.setError, PRODUCT_FORM_FIELDS)) showApiError(error)
 */
export function applyFieldErrors<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  const topLevelFields: readonly string[] = fields
  const invalidFields = Object.entries(error.errors)
    .map(([field, message]) => {
      const path = toFormPath(field)
      return { path, message, order: topLevelFields.indexOf(path.split(".")[0]) }
    })
    .filter(({ order }) => order >= 0)
    // Focus follows the form's field order, not the order the backend reported the errors in.
    .sort((a, b) => a.order - b.order)

  invalidFields.forEach(({ path, message }, index) =>
    // Safe: the path starts with one of the form's own fields.
    setError(path as Path<T>, { type: "server", message }, { shouldFocus: index === 0 }),
  )
  return invalidFields.length > 0
}

/** Spring names list elements with brackets, react-hook-form with dots: "items[0].quantity" → "items.0.quantity". */
function toFormPath(field: string): string {
  return field.replace(/\[(\d+)\]/g, ".$1")
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback
}

function parseErrors(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {}
  }
  const errors: Record<string, string> = {}
  for (const [field, message] of Object.entries(value)) {
    if (typeof message === "string") {
      errors[field] = message
    }
  }
  return errors
}

function parseShortages(value: unknown): Shortage[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter(
    (item): item is Shortage =>
      isRecord(item) &&
      typeof item.productId === "number" &&
      typeof item.sku === "string" &&
      typeof item.name === "string" &&
      typeof item.requested === "number" &&
      typeof item.available === "number",
  )
}
