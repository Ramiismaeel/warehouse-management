import { PackageOpen, Plus, RotateCw, TriangleAlert } from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router"

import { PageHeader } from "@/components/layout/PageHeader"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { DocumentStatusFilter } from "@/features/documents/components/DocumentStatusFilter"
import { useDocumentStatusParam } from "@/features/documents/useDocumentStatusParam"
import { INBOUND_COLUMNS } from "@/features/inbound/components/inboundColumns"
import { useInboundDeliveries } from "@/features/inbound/queries"
import { t } from "@/i18n/de"

const text = t.inbound

export function InboundListPage() {
  const deliveries = useInboundDeliveries()
  const [status, setStatus] = useDocumentStatusParam()

  const filtered = useMemo(
    () =>
      status === null
        ? deliveries.data
        : deliveries.data?.filter((delivery) => delivery.status === status),
    [deliveries.data, status],
  )
  const allStatuses = useMemo(
    () => deliveries.data?.map((delivery) => delivery.status),
    [deliveries.data],
  )

  const createButton = (size: "default" | "sm") => (
    <Button size={size} asChild>
      <Link to="/wareneingang/neu">
        <Plus />
        {text.actions.create}
      </Link>
    </Button>
  )

  let emptyState
  if (deliveries.isError) {
    emptyState = (
      <EmptyState
        icon={TriangleAlert}
        title={text.list.loadError}
        description={deliveries.error.detail}
        action={
          <Button variant="outline" size="sm" onClick={() => deliveries.refetch()}>
            <RotateCw />
            {t.common.actions.retry}
          </Button>
        }
      />
    )
  } else if (status !== null && (deliveries.data?.length ?? 0) > 0) {
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
        columns={INBOUND_COLUMNS}
        data={filtered}
        isLoading={deliveries.isPending}
        searchColumns={["number", "supplierName"]}
        searchPlaceholder={text.list.search}
        initialSorting={[{ id: "number", desc: true }]}
        pageResetKey={status}
        emptyState={emptyState}
      />
    </>
  )
}
