import { FileQuestion, Lock, RotateCw, TriangleAlert } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OutboundForm } from "@/features/outbound/components/OutboundForm"
import {
  isValidOutboundOrderId,
  useOutboundOrder,
  useUpdateOutboundOrder,
} from "@/features/outbound/queries"
import { toOutboundFormValues } from "@/features/outbound/schema"
import type { OutboundOrderRequest } from "@/features/outbound/types"
import { t } from "@/i18n/de"

const text = t.outbound

export function OutboundEditPage() {
  const id = Number(useParams().id)
  const order = useOutboundOrder(id)
  const updateOrder = useUpdateOutboundOrder()
  const navigate = useNavigate()
  const detailPath = `/warenausgang/${id}`

  const save = async (request: OutboundOrderRequest) => {
    const saved = await updateOrder.mutateAsync({ id, request })
    toast.success(text.saved.updated(saved.number))
    await navigate(detailPath)
  }

  let title: string = text.edit.title
  let content
  if (!isValidOutboundOrderId(id) || order.error?.status === 404) {
    content = (
      <EmptyState
        icon={FileQuestion}
        title={text.detail.notFound}
        description={text.detail.notFoundDescription}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/warenausgang">{text.detail.backToList}</Link>
          </Button>
        }
      />
    )
  } else if (order.isError) {
    content = (
      <EmptyState
        icon={TriangleAlert}
        title={text.detail.loadError}
        description={order.error.detail}
        action={
          <Button variant="outline" size="sm" onClick={() => order.refetch()}>
            <RotateCw />
            {t.common.actions.retry}
          </Button>
        }
      />
    )
  } else if (order.isPending) {
    content = (
      <div className="flex max-w-4xl flex-col gap-6">
        <Skeleton className="h-64 rounded-4xl" />
        <Skeleton className="h-72 rounded-4xl" />
      </div>
    )
  } else if (order.data.status !== "DRAFT") {
    // Business rule 5: only drafts can be edited (also when someone opens the URL directly).
    content = (
      <EmptyState
        icon={Lock}
        title={text.edit.notDraft}
        description={text.edit.notDraftDescription(t.common.documentStatus[order.data.status])}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to={detailPath}>{text.edit.backToDetail}</Link>
          </Button>
        }
      />
    )
  } else {
    title = text.edit.titleNumbered(order.data.number)
    content = (
      <OutboundForm
        // A fresh form per Warenausgang, so the default values always belong to the loaded one.
        key={order.data.id}
        defaultValues={toOutboundFormValues(order.data)}
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
