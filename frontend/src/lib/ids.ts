/** Only plain digits: rejects "abc", "-1", "1.5" and "1e20" (which Number() would accept). */
const ID_PARAM = /^\d+$/

/**
 * Parses an `:id` route param. Returns NaN for anything that is not a valid database id,
 * so the page can show "nicht gefunden" without asking the backend.
 *
 * @example
 * const id = parseIdParam(useParams().id)
 */
export function parseIdParam(param: string | undefined): number {
  if (param === undefined || !ID_PARAM.test(param)) {
    return Number.NaN
  }
  const id = Number(param)
  return isValidId(id) ? id : Number.NaN
}

/** A database id: a positive safe integer. */
export function isValidId(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0
}
