import { CircleSlash, FilePen, Package, RotateCw, TriangleAlert, Users } from "lucide-react"

import { PageHeader } from "@/components/layout/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { KpiCard } from "@/features/dashboard/components/KpiCard"
import { LowStockCard } from "@/features/dashboard/components/LowStockCard"
import { RecentDocumentsCard } from "@/features/dashboard/components/RecentDocumentsCard"
import { useDashboard } from "@/features/dashboard/queries"
import type { Dashboard } from "@/features/dashboard/types"
import { productListWithStockFilter } from "@/features/products/useStockFilterParam"
import { t } from "@/i18n/de"
import { formatNumber } from "@/lib/format"

const text = t.dashboard

export function DashboardPage() {
  const dashboard = useDashboard()

  let content
  if (dashboard.data) {
    // Also when a background refetch failed: the last loaded numbers are better than an error.
    content = <DashboardContent data={dashboard.data} />
  } else if (dashboard.isError) {
    content = (
      <EmptyState
        icon={TriangleAlert}
        title={text.loadError}
        description={dashboard.error.detail}
        action={
          <Button variant="outline" size="sm" onClick={() => dashboard.refetch()}>
            <RotateCw />
            {t.common.actions.retry}
          </Button>
        }
      />
    )
  } else {
    content = <DashboardSkeleton />
  }

  return (
    <>
      <PageHeader title={text.title} description={text.description} />
      {content}
    </>
  )
}

function DashboardContent({ data }: { data: Dashboard }) {
  const openDrafts = data.openInboundDrafts + data.openOutboundDrafts
  // The backend's lowStockCount includes the empty products (0 ≤ Mindestbestand, rule 8).
  // The cards show them apart, like StockBadge does: Niedrig + Leer = lowStockCount.
  const lowNotEmptyCount = data.lowStockCount - data.outOfStockCount

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label={text.kpis.products}
          value={data.productCount}
          icon={Package}
          to="/artikel"
        />
        <KpiCard label={text.kpis.customers} value={data.customerCount} icon={Users} to="/kunden" />
        <KpiCard
          label={text.kpis.lowStock}
          value={lowNotEmptyCount}
          hint={text.kpis.lowStockHint}
          icon={TriangleAlert}
          tone="warning"
          to={productListWithStockFilter("LOW")}
        />
        <KpiCard
          label={text.kpis.outOfStock}
          value={data.outOfStockCount}
          hint={text.kpis.outOfStockHint}
          icon={CircleSlash}
          tone="danger"
          to={productListWithStockFilter("EMPTY")}
        />
        <KpiCard
          label={text.kpis.openDrafts}
          value={openDrafts}
          icon={FilePen}
          links={[
            {
              label: text.kpis.openInboundDrafts(
                data.openInboundDrafts,
                formatNumber(data.openInboundDrafts),
              ),
              to: "/wareneingang?status=DRAFT",
            },
            {
              label: text.kpis.openOutboundDrafts(
                data.openOutboundDrafts,
                formatNumber(data.openOutboundDrafts),
              ),
              to: "/warenausgang?status=DRAFT",
            },
          ]}
        />
      </div>

      <LowStockCard products={data.lowStockProducts} total={data.lowStockCount} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentDocumentsCard
          title={text.recent.inboundTitle}
          basePath="/wareneingang"
          emptyText={text.recent.inboundEmpty}
          documents={data.recentInbound.map((delivery) => ({
            id: delivery.id,
            number: delivery.number,
            partner: delivery.supplierName,
            date: delivery.deliveryDate,
            status: delivery.status,
            itemCount: delivery.itemCount,
          }))}
        />
        <RecentDocumentsCard
          title={text.recent.outboundTitle}
          basePath="/warenausgang"
          emptyText={text.recent.outboundEmpty}
          documents={data.recentOutbound.map((order) => ({
            id: order.id,
            number: order.number,
            partner: order.customerName,
            date: order.orderDate,
            status: order.status,
            itemCount: order.itemCount,
          }))}
        />
      </div>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-4xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-4xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-4xl" />
        <Skeleton className="h-72 rounded-4xl" />
      </div>
    </>
  )
}
