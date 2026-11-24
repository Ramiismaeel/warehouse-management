import { Button } from "@/components/ui/button"
import type { DocumentStatus } from "@/features/documents/types"
import { t } from "@/i18n/de"
import { formatNumber } from "@/lib/format"

const STATUSES: readonly DocumentStatus[] = ["DRAFT", "CONFIRMED", "CANCELLED"]

interface DocumentStatusFilterProps {
  /** null = all statuses. */
  value: DocumentStatus | null
  onChange: (status: DocumentStatus | null) => void
  /** Every status of the unfiltered list, to show a count per button. */
  statuses?: readonly DocumentStatus[]
}

/** Buttons "Alle · Entwurf · Bestätigt · Storniert" above a Beleg list, each with its count. */
export function DocumentStatusFilter({ value, onChange, statuses }: DocumentStatusFilterProps) {
  const countOf = (status: DocumentStatus | null) =>
    statuses === undefined
      ? undefined
      : statuses.filter((candidate) => status === null || candidate === status).length

  const options: { status: DocumentStatus | null; label: string }[] = [
    { status: null, label: t.documents.statusFilter.all },
    ...STATUSES.map((status) => ({ status, label: t.common.documentStatus[status] })),
  ]

  return (
    <div role="group" aria-label={t.documents.statusFilter.label} className="flex flex-wrap gap-2">
      {options.map(({ status, label }) => {
        const count = countOf(status)
        const isActive = value === status
        return (
          <Button
            key={status ?? "ALL"}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            aria-pressed={isActive}
            onClick={() => onChange(status)}
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
