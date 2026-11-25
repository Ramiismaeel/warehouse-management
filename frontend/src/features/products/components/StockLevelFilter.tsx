import { Button } from "@/components/ui/button"
import { STOCK_FILTERS, type StockFilter } from "@/features/products/useStockFilterParam"
import { t } from "@/i18n/de"
import { formatNumber } from "@/lib/format"
import type { StockLevel } from "@/lib/stock"

const text = t.products.stockFilter

interface StockLevelFilterProps {
  /** null = all products. */
  value: StockFilter | null
  onChange: (filter: StockFilter | null) => void
  /** The stock level of every product of the unfiltered list, to show a count per button. */
  levels?: readonly StockLevel[]
}

/** Buttons "Alle · Niedriger Bestand · Leer" above the Artikel list, each with its count. */
export function StockLevelFilter({ value, onChange, levels }: StockLevelFilterProps) {
  const countOf = (filter: StockFilter | null) =>
    levels === undefined
      ? undefined
      : levels.filter((level) => filter === null || level === filter).length

  const options: { filter: StockFilter | null; label: string }[] = [
    { filter: null, label: text.all },
    ...STOCK_FILTERS.map((filter) => ({ filter, label: text[filter] })),
  ]

  return (
    <div role="group" aria-label={text.label} className="flex flex-wrap gap-2">
      {options.map(({ filter, label }) => {
        const count = countOf(filter)
        const isActive = value === filter
        return (
          <Button
            key={filter ?? "ALL"}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            aria-pressed={isActive}
            onClick={() => onChange(filter)}
          >
            {label}
            {count !== undefined && (
              <span className="tabular-nums opacity-70">{formatNumber(count)}</span>
            )}
          </Button>
        )
      })}
    </div>
  )
}
