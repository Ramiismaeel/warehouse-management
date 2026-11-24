import { ArrowLeft, FileQuestion, RotateCw, TriangleAlert } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Customer } from "@/features/customers/types"
import { DocumentActions } from "@/features/documents/components/DocumentActions"
import { DocumentItemsTable } from "@/features/documents/components/DocumentItemsTable"
import { ShortageAlert } from "@/features/documents/components/ShortageAlert"
import type { DocumentItem } from "@/features/documents/types"
import {
  isValidOutboundOrderId,
  useCancelOutboundOrder,
  useConfirmOutboundOrder,
  useDeleteOutboundOrder,
  useOutboundOrder,
} from "@/features/outbound/queries"
import type { OutboundOrderDetail } from "@/features/outbound/types"
import { useProducts } from "@/features/products/queries"
import type { Product } from "@/features/products/types"
import { t } from "@/i18n/de"
import type { ApiError, Shortage } from "@/lib/errors"
import { formatDate, formatNumber } from "@/lib/format"

const text = t.outbound
const alertText = t.documents.shortageAlert

export function OutboundDetailPage() {
  const id = Number(useParams().id)
  const order = useOutboundOrder(id)

  let content: ReactNode
  if (!isValidOutboundOrderId(id) || order.error?.status === 404) {
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
  } else if (order.isError) {
    content = (
      <>
        <PageHeader title={text.detail.title} />
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
      </>
    )
  } else if (order.isPending) {
    content = (
      <>
        <PageHeader title={text.detail.title} description={text.detail.description} />
        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <Skeleton className="h-96 rounded-4xl" />
          <Skeleton className="h-72 rounded-4xl" />
        </div>
      </>
    )
  } else {
    // Keyed, so the failed-confirm box of one Warenausgang never shows on another.
    content = <OutboundOrderView key={order.data.id} order={order.data} />
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="-mb-2 self-start" asChild>
        <Link to="/warenausgang">
          <ArrowLeft />
          {text.detail.backToList}
        </Link>
      </Button>
      {content}
    </>
  )
}

function OutboundOrderView({ order }: { order: OutboundOrderDetail }) {
  const confirm = useConfirmOutboundOrder()
  const cancel = useCancelOutboundOrder()
  const remove = useDeleteOutboundOrder()
  const products = useProducts()
  const navigate = useNavigate()
  const { id, number } = order

  /** The 409 of the last Bestätigen, kept until hidden or the next successful action. */
  const [failedConfirm, setFailedConfirm] = useState<ApiError | null>(null)

  const expectedShortages = useMemo(
    () => (order.status === "DRAFT" ? findShortages(order.items, products.data) : []),
    [order.status, order.items, products.data],
  )

  let shortageAlert: ReactNode = null
  if (failedConfirm) {
    shortageAlert = (
      <ShortageAlert
        variant="error"
        title={failedConfirm.detail}
        description={alertText.failedDescription}
        shortages={failedConfirm.shortages}
        onDismiss={() => setFailedConfirm(null)}
      />
    )
  } else if (expectedShortages.length > 0) {
    shortageAlert = (
      <ShortageAlert
        variant="warning"
        title={alertText.precheckTitle(expectedShortages.length)}
        description={alertText.precheckDescription}
        shortages={expectedShortages}
      />
    )
  }

  return (
    <>
      <PageHeader
        title={text.detail.titleNumbered(number)}
        description={order.customerName}
        actions={
          <DocumentActions
            status={order.status}
            documentNumber={number}
            direction="OUT"
            editTo={`/warenausgang/${id}/bearbeiten`}
            onConfirm={async () => {
              await confirm.mutateAsync(id)
              setFailedConfirm(null)
              toast.success(text.detail.confirmed(number))
            }}
            onCancel={async () => {
              await cancel.mutateAsync(id)
              toast.success(text.detail.cancelled(number))
            }}
            onDelete={async () => {
              await remove.mutateAsync(id)
              toast.success(text.detail.deleted(number))
              await navigate("/warenausgang")
            }}
            onError={(error, action) => {
              if (action === "confirm" && error.shortages.length > 0) {
                setFailedConfirm(error)
              }
            }}
          />
        }
      />

      {shortageAlert}

      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{text.detail.header}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3">
                <HeaderField label={text.fields.status}>
                  <StatusBadge status={order.status} />
                </HeaderField>
                <HeaderField label={text.fields.number}>
                  <span className="font-mono text-xs">{number}</span>
                </HeaderField>
                <HeaderField label={text.fields.orderDate}>
                  {order.orderDate ? formatDate(order.orderDate) : "–"}
                </HeaderField>
                <HeaderField label={text.fields.itemCount}>
                  {formatNumber(order.itemCount)}
                </HeaderField>
                <HeaderField label={text.fields.totalQuantity}>
                  {formatNumber(order.totalQuantity)}
                </HeaderField>
                <HeaderField label={text.fields.note}>
                  {order.note ? (
                    <span className="whitespace-pre-line">{order.note}</span>
                  ) : (
                    <span className="text-muted-foreground">{text.detail.noNote}</span>
                  )}
                </HeaderField>
              </dl>
            </CardContent>
          </Card>

          <CustomerCard customer={order.customer} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{text.detail.items}</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentItemsTable items={order.items} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

/** Name (links to the Kunde), address and contact of the Warenausgang's customer. */
function CustomerCard({ customer }: { customer: Customer }) {
  const cityLine = [customer.zipCode, customer.city].filter(Boolean).join(" ")
  const hasContact = Boolean(customer.street || cityLine || customer.email || customer.phone)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.detail.customer}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Link
          to={`/kunden/${customer.id}/bearbeiten`}
          className="font-medium underline-offset-4 hover:underline"
        >
          {customer.name}
        </Link>
        {customer.street && <p>{customer.street}</p>}
        {cityLine && <p>{cityLine}</p>}
        {customer.email && (
          <p>
            <a href={`mailto:${customer.email}`} className="underline-offset-4 hover:underline">
              {customer.email}
            </a>
          </p>
        )}
        {customer.phone && (
          <p>
            <a href={`tel:${customer.phone}`} className="underline-offset-4 hover:underline">
              {customer.phone}
            </a>
          </p>
        )}
        {!hasContact && <p className="text-muted-foreground">{text.detail.noContact}</p>}
      </CardContent>
    </Card>
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

/**
 * Draft stock check (business rule 3) with the cached Bestand: every Artikelzeile that wants more
 * than is in stock. Only a hint; the backend decides on Bestätigen.
 */
function findShortages(items: DocumentItem[], products: Product[] | undefined): Shortage[] {
  if (!products) {
    return []
  }
  const productsById = new Map(products.map((product) => [product.id, product]))
  return items.flatMap((item) => {
    const product = productsById.get(item.productId)
    return product && item.quantity > product.quantity
      ? [
          {
            productId: item.productId,
            sku: item.sku,
            name: item.name,
            requested: item.quantity,
            available: product.quantity,
          },
        ]
      : []
  })
}
