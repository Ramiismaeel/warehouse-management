import { useSearchParams } from "react-router"

import type { StockLevel } from "@/lib/stock"

/** The stock levels the Artikel list can be filtered by. Same meaning as StockBadge and the dashboard cards. */
export type StockFilter = Extract<StockLevel, "LOW" | "EMPTY">

export const STOCK_FILTERS: readonly StockFilter[] = ["LOW", "EMPTY"]

const PARAM = "bestand"

/** German URL values, e.g. /artikel?bestand=niedrig. */
const PARAM_VALUES: Record<StockFilter, string> = {
  LOW: "niedrig",
  EMPTY: "leer",
}

/**
 * Link to the Artikel list filtered by stock level (business rule 8):
 * LOW = Bestand ≤ Mindestbestand but not 0, EMPTY = Bestand 0.
 *
 * @example
 * <Link to={productListWithStockFilter("EMPTY")}>…</Link> // "/artikel?bestand=leer"
 */
export function productListWithStockFilter(filter: StockFilter): string {
  return `/artikel?${new URLSearchParams({ [PARAM]: PARAM_VALUES[filter] }).toString()}`
}

/**
 * The stock filter of the Artikel list, kept in the URL (?bestand=niedrig|leer), so the dashboard
 * can link to it and it survives going back. null = all products; an unknown value counts as null.
 */
export function useStockFilterParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const param = searchParams.get(PARAM)
  const filter = STOCK_FILTERS.find((candidate) => PARAM_VALUES[candidate] === param) ?? null

  const setFilter = (next: StockFilter | null) => {
    setSearchParams(
      (current) => {
        const updated = new URLSearchParams(current)
        if (next) {
          updated.set(PARAM, PARAM_VALUES[next])
        } else {
          updated.delete(PARAM)
        }
        return updated
      },
      { replace: true },
    )
  }

  return [filter, setFilter] as const
}
