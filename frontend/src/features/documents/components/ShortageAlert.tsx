import { TriangleAlert, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { t } from "@/i18n/de"
import type { Shortage } from "@/lib/errors"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const VARIANT_CLASSES = {
  /** Expected problem, nothing failed yet (e.g. a draft that can't be confirmed yet). */
  warning:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
  /** An action failed (e.g. Bestätigen returned 409). */
  error: "border-destructive/40 bg-destructive/10 text-destructive",
} as const

interface ShortageAlertProps {
  variant: keyof typeof VARIANT_CLASSES
  title: string
  description?: string
  /** One line per product: SKU Name: benötigt X, verfügbar Y. */
  shortages: Shortage[]
  /** Shows an "Ausblenden" button. */
  onDismiss?: () => void
}

/** Box that lists every product without enough Bestand (business rule 3). */
export function ShortageAlert({
  variant,
  title,
  description,
  shortages,
  onDismiss,
}: ShortageAlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-3xl border p-4 text-sm", VARIANT_CLASSES[variant])}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="font-medium">{title}</p>
        {description && <p className="opacity-90">{description}</p>}
        <ul className="list-disc space-y-0.5 pl-4">
          {shortages.map((shortage) => (
            <li key={shortage.productId}>
              {t.documents.shortage(
                shortage.sku,
                shortage.name,
                formatNumber(shortage.requested),
                formatNumber(shortage.available),
              )}
            </li>
          ))}
        </ul>
      </div>
      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="-mt-1 -mr-1 text-current hover:bg-transparent hover:opacity-70"
          aria-label={t.documents.shortageAlert.dismiss}
          title={t.documents.shortageAlert.dismiss}
          onClick={onDismiss}
        >
          <X />
        </Button>
      )}
    </div>
  )
}
