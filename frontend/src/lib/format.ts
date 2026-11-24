import { format, isValid } from "date-fns"

const LOCALE = "de-DE"

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const numberFormatter = new Intl.NumberFormat(LOCALE)

/** Matches a plain ISO date from the backend, e.g. "2026-11-12" (LocalDate). */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Formats a date as dd.MM.yyyy, e.g. "2026-11-12" → "12.11.2026".
 * Accepts ISO dates ("2026-11-12"), ISO timestamps ("2026-11-12T10:00:00Z") and Date objects.
 * Returns "" for an invalid value.
 */
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? parseDate(value) : value
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date)
}

/**
 * Formats a number with German separators, e.g. 1234.5 → "1.234,5".
 * Pass options for special cases, e.g. { maximumFractionDigits: 0 }.
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return options
    ? new Intl.NumberFormat(LOCALE, options).format(value)
    : numberFormatter.format(value)
}

/** A local date as the backend's ISO date (LocalDate), e.g. 12 Nov 2026 → "2026-11-12". */
export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/** Parses an ISO date ("2026-11-12") as a local date. Returns undefined for "" or an invalid value. */
export function parseIsoDate(value: string): Date | undefined {
  if (!ISO_DATE.test(value)) {
    return undefined
  }
  const date = parseDate(value)
  return isValid(date) ? date : undefined
}

/**
 * Plain dates are built in local time: new Date("2026-11-12") would be UTC midnight
 * and show the previous day in time zones west of UTC.
 */
function parseDate(value: string): Date {
  const match = ISO_DATE.exec(value)
  if (match) {
    const [, year, month, day] = match
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  return new Date(value)
}
