import { Badge } from "@/components/ui/badge"
import type { DocumentStatus } from "@/features/documents/types"
import { t } from "@/i18n/de"
import { cn } from "@/lib/utils"

const STATUS_CLASSES: Record<DocumentStatus, string> = {
  DRAFT: "",
  CONFIRMED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  CANCELLED: "",
}

const STATUS_VARIANTS = {
  DRAFT: "secondary",
  CONFIRMED: "secondary",
  CANCELLED: "destructive",
} as const satisfies Record<DocumentStatus, "secondary" | "destructive">

/** Status of a Beleg: Entwurf (gray), Bestätigt (green), Storniert (red). */
export function StatusBadge({ status, className }: { status: DocumentStatus; className?: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={cn(STATUS_CLASSES[status], className)}>
      {t.common.documentStatus[status]}
    </Badge>
  )
}
