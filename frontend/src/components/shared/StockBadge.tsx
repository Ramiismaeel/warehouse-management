import { Badge } from "@/components/ui/badge"
import { t } from "@/i18n/de"
import { getStockLevel, type StockLevel } from "@/lib/stock"
import { cn } from "@/lib/utils"

const LEVEL_CLASSES: Record<StockLevel, string> = {
  EMPTY: "",
  LOW: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  OK: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
}

const LEVEL_VARIANTS = {
  EMPTY: "destructive",
  LOW: "secondary",
  OK: "secondary",
} as const satisfies Record<StockLevel, "secondary" | "destructive">

interface StockBadgeProps {
  quantity: number
  minQuantity: number
  className?: string
}

/** Stock level of an Artikel (business rule 8): Leer (0, red), Niedrig (≤ Mindestbestand, amber), OK (green). */
export function StockBadge({ quantity, minQuantity, className }: StockBadgeProps) {
  const level = getStockLevel(quantity, minQuantity)

  return (
    <Badge variant={LEVEL_VARIANTS[level]} className={cn(LEVEL_CLASSES[level], className)}>
      {t.common.stockLevel[level]}
    </Badge>
  )
}
