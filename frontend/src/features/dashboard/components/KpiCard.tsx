import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link } from "react-router"

import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const TONE_CLASSES = {
  default: "bg-muted text-muted-foreground",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  danger: "bg-destructive/10 text-destructive",
} as const

const FOCUS_RING = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

export interface KpiLink {
  label: string
  /** The list behind this part of the number, e.g. "/wareneingang?status=DRAFT". */
  to: string
}

interface KpiCardBaseProps {
  label: string
  value: number
  icon: LucideIcon
  hint?: string
  /** Colors the icon only while value > 0, so a 0 never looks alarming. */
  tone?: keyof typeof TONE_CLASSES
}

type KpiCardProps = KpiCardBaseProps &
  (
    | {
        /** The list behind the number. The whole card links to it. */
        to: string
        links?: never
      }
    | {
        to?: never
        /** One link per part of the number, shown under it. The card itself is not a link. */
        links: KpiLink[]
      }
  )

/** One key figure of the dashboard. Links to the matching list, or to one list per part. */
export function KpiCard({
  label,
  value,
  icon: Icon,
  to,
  links,
  hint,
  tone = "default",
}: KpiCardProps) {
  const card = (
    <Card size="sm" className={cn("h-full", to && "transition-shadow group-hover:shadow-lg")}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
            {formatNumber(value)}
          </p>
          {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
          {links && (
            <ul className="space-y-0.5">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={cn(
                      "inline-flex max-w-full items-center gap-0.5 rounded-sm text-xs text-muted-foreground hover:text-foreground hover:underline",
                      FOCUS_RING,
                    )}
                  >
                    <span className="truncate">{link.label}</span>
                    <ChevronRight className="size-3 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
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
  )

  if (!to) {
    return card
  }

  return (
    <Link to={to} className={cn("group rounded-4xl", FOCUS_RING)}>
      {card}
    </Link>
  )
}
