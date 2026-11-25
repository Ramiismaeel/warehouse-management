import { PackageOpen, Plus, RotateCw, TriangleAlert } from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router"

import { PageHeader } from "@/components/layout/PageHeader"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { DocumentStatusFilter } from "@/features/documents/components/DocumentStatusFilter"
import { useDocumentStatusParam } from "@/features/documents/useDocumentStatusParam"
import { OUTBOUND_COLUMNS } from "@/features/outbound/components/outboundColumns"
import { useOutboundOrders } from "@/features/outbound/queries"
import { t } from "@/i18n/de"

const text = t.outbound

export function OutboundListPage() {
  const orders = useOutboundOrders()
  const [status, setStatus] = useDocumentStatusParam()

  const filtered = useMemo(
    () => (status === null ? orders.data : orders.data?.filter((order) => order.status === status)),
    [orders.data, status],
  )
  const allStatuses = useMemo(() => orders.data?.map((order) => order.status), [orders.data])

  const createButton = (size: "default" | "sm") => (
    <Button size={size} asChild>
      <Link to="/warenausgang/neu">
        <Plus />
        {text.actions.create}
      </Link>
    </Button>
  )

  let emptyState
  if (orders.isError) {
    emptyState = (
      <EmptyState
        icon={TriangleAlert}
        title={text.list.loadError}
        description={orders.error.detail}
        action={
          <Button variant="outline" size="sm" onClick={() => orders.refetch()}>
            <RotateCw />
            {t.common.actions.retry}
          </Button>
        }
      />
    )
  } else if (status !== null && (orders.data?.length ?? 0) > 0) {
    emptyState = <EmptyState icon={PackageOpen} title={text.list.emptyFiltered} />
  } else {
    emptyState = (
      <EmptyState
        icon={PackageOpen}
        title={text.list.empty}
        description={text.list.emptyDescription}
        action={createButton("sm")}
      />
    )
  }

  return (
    <>
      <PageHeader
        title={text.list.title}
        description={text.list.description}
        actions={createButton("default")}
      />

      <DocumentStatusFilter value={status} onChange={setStatus} statuses={allStatuses} />

      <DataTable
        columns={OUTBOUND_COLUMNS}
        data={filtered}
        isLoading={orders.isPending}
        searchColumns={["number", "customerName"]}
        searchPlaceholder={text.list.search}
        initialSorting={[{ id: "number", desc: true }]}
        pageResetKey={status}
        emptyState={emptyState}
      />
    </>
  )
}
