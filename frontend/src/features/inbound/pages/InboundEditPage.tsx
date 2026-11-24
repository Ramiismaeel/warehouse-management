import { FileQuestion, Lock, RotateCw, TriangleAlert } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { InboundForm } from "@/features/inbound/components/InboundForm"
import {
  isValidInboundDeliveryId,
  useInboundDelivery,
  useUpdateInboundDelivery,
} from "@/features/inbound/queries"
import { toInboundFormValues } from "@/features/inbound/schema"
import type { InboundDeliveryRequest } from "@/features/inbound/types"
import { t } from "@/i18n/de"

const text = t.inbound

export function InboundEditPage() {
  const id = Number(useParams().id)
  const delivery = useInboundDelivery(id)
  const updateDelivery = useUpdateInboundDelivery()
  const navigate = useNavigate()
  const detailPath = `/wareneingang/${id}`

  const save = async (request: InboundDeliveryRequest) => {
    const saved = await updateDelivery.mutateAsync({ id, request })
    toast.success(text.saved.updated(saved.number))
    await navigate(detailPath)
  }

  let title: string = text.edit.title
  let content
  if (!isValidInboundDeliveryId(id) || delivery.error?.status === 404) {
    content = (
      <EmptyState
        icon={FileQuestion}
        title={text.detail.notFound}
        description={text.detail.notFoundDescription}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/wareneingang">{text.detail.backToList}</Link>
          </Button>
        }
      />
    )
  } else if (delivery.isError) {
    content = (
      <EmptyState
        icon={TriangleAlert}
        title={text.detail.loadError}
        description={delivery.error.detail}
        action={
          <Button variant="outline" size="sm" onClick={() => delivery.refetch()}>
            <RotateCw />
            {t.common.actions.retry}
          </Button>
        }
      />
    )
  } else if (delivery.isPending) {
    content = (
      <div className="flex max-w-4xl flex-col gap-6">
        <Skeleton className="h-64 rounded-4xl" />
        <Skeleton className="h-72 rounded-4xl" />
      </div>
    )
  } else if (delivery.data.status !== "DRAFT") {
    // Business rule 5: only drafts can be edited (also when someone opens the URL directly).
    content = (
      <EmptyState
        icon={Lock}
        title={text.edit.notDraft}
        description={text.edit.notDraftDescription(t.common.documentStatus[delivery.data.status])}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to={detailPath}>{text.edit.backToDetail}</Link>
          </Button>
        }
      />
    )
  } else {
    title = text.edit.titleNumbered(delivery.data.number)
    content = (
      <InboundForm
        // A fresh form per Wareneingang, so the default values always belong to the loaded one.
        key={delivery.data.id}
        defaultValues={toInboundFormValues(delivery.data)}
        cancelTo={detailPath}
        onSubmit={save}
      />
    )
  }

  return (
    <>
      <PageHeader title={title} description={text.edit.description} />
      {content}
    </>
  )
}
