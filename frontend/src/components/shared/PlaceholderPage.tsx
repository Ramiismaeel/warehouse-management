import { Construction } from "lucide-react"
import { useParams } from "react-router"

import { PageHeader } from "@/components/layout/PageHeader"
import { t } from "@/i18n/de"

interface PlaceholderPageProps {
  title: string
  description?: string
}

/** Temporary content for routes whose feature is not built yet. Shows the route's :id, if any. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const { id } = useParams()

  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <Construction className="size-8" />
        <p className="text-sm">{t.common.placeholder.text}</p>
        {id && (
          <p className="text-xs" >
            {t.common.placeholder.id}: {id}
          </p>
        )}
      </div>
    </>
  )
}
