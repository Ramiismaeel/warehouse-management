import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  /** Buttons shown on the right, e.g. a "Neu anlegen" button. */
  actions?: ReactNode
}

/** Title row at the top of every page. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
