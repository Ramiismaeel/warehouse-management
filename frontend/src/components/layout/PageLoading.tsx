import { LoaderCircle } from "lucide-react"

import { t } from "@/i18n/de"

/** Shown inside the app layout while the code of the first page is still loading (lazy routes). */
export function PageLoading() {
  return (
    <div role="status" className="flex flex-1 items-center justify-center py-16">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">{t.common.loading}</span>
    </div>
  )
}
