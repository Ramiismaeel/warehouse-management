import { FileText } from "lucide-react"
import { Link } from "react-router"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DocumentStatus } from "@/features/documents/types"
import { t } from "@/i18n/de"
import { formatDate } from "@/lib/format"

const text = t.dashboard.recent

/** The fields both a Wareneingang and a Warenausgang row show. */
export interface RecentDocument {
  id: number
  number: string
  /** Lieferant or Kunde. */
  partner: string
  /** ISO date, may be null. */
  date: string | null
  status: DocumentStatus
  itemCount: number
}

interface RecentDocumentsCardProps {
  title: string
  documents: RecentDocument[]
  /** List route, e.g. "/wareneingang". Rows link to `${basePath}/${id}`. */
  basePath: string
  emptyText: string
}

/** The newest Belege of one kind, each row linking to its detail page. */
export function RecentDocumentsCard({
  title,
  documents,
  basePath,
  emptyText,
}: RecentDocumentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link to={basePath}>{text.showAll}</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <EmptyState icon={FileText} title={emptyText} className="py-6" />
        ) : (
          <ul className="-mx-3 flex flex-col">
            {documents.map((document) => (
              <li key={document.id}>
                <Link
                  to={`${basePath}/${document.id}`}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 outline-none hover:bg-muted focus-visible:bg-muted"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{document.partner}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{document.number}</span>
                      {document.date && ` · ${formatDate(document.date)}`}
                      {` · ${text.itemCount(document.itemCount)}`}
                    </p>
                  </div>
                  <StatusBadge status={document.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
