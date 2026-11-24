import { ArrowLeft, FileQuestion, RotateCw, TriangleAlert } from "lucide-react"
import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DocumentActions } from "@/features/documents/components/DocumentActions"
import { DocumentItemsTable } from "@/features/documents/components/DocumentItemsTable"
import {
  isValidInboundDeliveryId,
  useCancelInboundDelivery,
  useConfirmInboundDelivery,
  useDeleteInboundDelivery,
  useInboundDelivery,
} from "@/features/inbound/queries"
import type { InboundDeliveryDetail } from "@/features/inbound/types"
import { t } from "@/i18n/de"
import { formatDate, formatNumber } from "@/lib/format"

const text = t.inbound

export function InboundDetailPage() {
  const id = Number(useParams().id)
  const delivery = useInboundDelivery(id)

  let content: ReactNode
  if (!isValidInboundDeliveryId(id) || delivery.error?.status === 404) {
    content = (
      <>
        <PageHeader title={text.detail.title} />
        <EmptyState
          icon={FileQuestion}
          title={text.detail.notFound}
          description={text.detail.notFoundDescription}
        />
      </>
    )
  } else if (delivery.isError) {
    content = (
      <>
        <PageHeader title={text.detail.title} />
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
      </>
    )
  } else if (delivery.isPending) {
    content = (
      <>
        <PageHeader title={text.detail.title} description={text.detail.description} />
        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <Skeleton className="h-72 rounded-4xl" />
          <Skeleton className="h-72 rounded-4xl" />
        </div>
      </>
    )
  } else {
    content = <InboundDeliveryView delivery={delivery.data} />
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="-mb-2 self-start" asChild>
        <Link to="/wareneingang">
          <ArrowLeft />
          {text.detail.backToList}
        </Link>
      </Button>
      {content}
    </>
  )
}

function InboundDeliveryView({ delivery }: { delivery: InboundDeliveryDetail }) {
  const confirm = useConfirmInboundDelivery()
  const cancel = useCancelInboundDelivery()
  const remove = useDeleteInboundDelivery()
  const navigate = useNavigate()
  const { id, number } = delivery

  return (
    <>
      <PageHeader
        title={text.detail.titleNumbered(number)}
        description={delivery.supplierName}
        actions={
          <DocumentActions
            status={delivery.status}
            documentNumber={number}
            direction="IN"
            editTo={`/wareneingang/${id}/bearbeiten`}
            onConfirm={async () => {
              await confirm.mutateAsync(id)
              toast.success(text.detail.confirmed(number))
            }}
            onCancel={async () => {
              await cancel.mutateAsync(id)
              toast.success(text.detail.cancelled(number))
            }}
            onDelete={async () => {
              await remove.mutateAsync(id)
              toast.success(text.detail.deleted(number))
              await navigate("/wareneingang")
            }}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>{text.detail.header}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3">
              <HeaderField label={text.fields.status}>
                <StatusBadge status={delivery.status} />
              </HeaderField>
              <HeaderField label={text.fields.number}>
                <span className="font-mono text-xs">{number}</span>
              </HeaderField>
              <HeaderField label={text.fields.supplierName}>{delivery.supplierName}</HeaderField>
              <HeaderField label={text.fields.deliveryDate}>
                {delivery.deliveryDate ? formatDate(delivery.deliveryDate) : "–"}
              </HeaderField>
              <HeaderField label={text.fields.itemCount}>
                {formatNumber(delivery.itemCount)}
              </HeaderField>
              <HeaderField label={text.fields.totalQuantity}>
                {formatNumber(delivery.totalQuantity)}
              </HeaderField>
              <HeaderField label={text.fields.note}>
                {delivery.note ? (
                  <span className="whitespace-pre-line">{delivery.note}</span>
                ) : (
                  <span className="text-muted-foreground">{text.detail.noNote}</span>
                )}
              </HeaderField>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{text.detail.items}</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentItemsTable items={delivery.items} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function HeaderField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  )
}
