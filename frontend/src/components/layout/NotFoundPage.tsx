import { FileQuestion } from "lucide-react"
import { Link } from "react-router"

import { DocumentTitle } from "@/components/layout/DocumentTitle"
import { Button } from "@/components/ui/button"
import { t } from "@/i18n/de"

/** Shown for every unknown route (path "*"), inside the app layout. */
export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <DocumentTitle title={t.common.notFound.title} />
      <FileQuestion className="size-12 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t.common.notFound.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.common.notFound.description}</p>
      </div>
      <Button asChild>
        <Link to="/">{t.common.actions.backToDashboard}</Link>
      </Button>
    </div>
  )
}
