import { RotateCw, TriangleAlert } from "lucide-react"
import { isRouteErrorResponse, Link, useRouteError } from "react-router"

import { DocumentTitle } from "@/components/layout/DocumentTitle"
import { NotFoundPage } from "@/components/layout/NotFoundPage"
import { Button } from "@/components/ui/button"
import { t } from "@/i18n/de"
import { cn } from "@/lib/utils"

interface RouteErrorPageProps {
  /** Fills the whole window: for errors in the app layout itself, when there is no layout around it. */
  fullScreen?: boolean
}

/**
 * errorElement of the routes: replaces React Router's English default error screen when a page
 * throws while rendering or its code can't be loaded (e.g. an old tab after a new deployment).
 */
export function RouteErrorPage({ fullScreen = false }: RouteErrorPageProps) {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center",
        fullScreen && "min-h-svh p-6",
      )}
    >
      <DocumentTitle title={t.common.routeError.title} />
      <TriangleAlert className="size-12 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t.common.routeError.title}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">{t.common.routeError.description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" asChild>
          <Link to="/" reloadDocument>
            {t.common.actions.backToDashboard}
          </Link>
        </Button>
        <Button onClick={() => window.location.reload()}>
          <RotateCw />
          {t.common.actions.retry}
        </Button>
      </div>
    </div>
  )
}
