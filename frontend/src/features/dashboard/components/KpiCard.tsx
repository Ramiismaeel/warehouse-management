import type { LucideIcon } from "lucide-react"
import { Link } from "react-router"

import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const TONE_CLASSES = {
  default: "bg-muted text-muted-foreground",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  danger: "bg-destructive/10 text-destructive",
} as const

interface KpiCardProps {
  label: string
  value: number
  icon: LucideIcon
  /** The list behind the number, e.g. "/wareneingang?status=DRAFT". */
  to: string
  hint?: string
  /** Colors the icon only while value > 0, so a 0 never looks alarming. */
  tone?: keyof typeof TONE_CLASSES
}

/** One key figure of the dashboard. The whole card links to the matching list. */
export function KpiCard({ label, value, icon: Icon, to, hint, tone = "default" }: KpiCardProps) {
  return (
    <Link
      to={to}
      className="group rounded-4xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card size="sm" className="h-full transition-shadow group-hover:shadow-lg">
        <CardContent className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
              {formatNumber(value)}
            </p>
            {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              TONE_CLASSES[value > 0 ? tone : "default"],
            )}
          >
            <Icon className="size-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
