import { Link } from "react-router"

import { createDataTableColumnHelper } from "@/components/shared/dataTableFeatures"
import { StatusBadge } from "@/components/shared/StatusBadge"
import type { InboundDeliverySummary } from "@/features/inbound/types"
import { t } from "@/i18n/de"
import { formatDate, formatNumber } from "@/lib/format"

const column = createDataTableColumnHelper<InboundDeliverySummary>()
const text = t.inbound.fields

/** Shown when a Wareneingang has no Lieferdatum. */
const MISSING = "–"

/** Columns of the Wareneingang list. The number links to the detail page. */
export const INBOUND_COLUMNS = column.columns([
  column.accessor("number", {
    header: text.number,
    cell: ({ row, getValue }) => (
      <Link
        to={`/wareneingang/${row.original.id}`}
        className="font-mono text-xs font-medium underline-offset-4 hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),
  column.accessor("supplierName", {
    header: text.supplierName,
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  // ISO dates sort correctly as strings; the cell shows them as dd.MM.yyyy.
  column.accessor((delivery) => delivery.deliveryDate ?? "", {
    id: "deliveryDate",
    header: text.deliveryDate,
    cell: ({ getValue }) =>
      getValue() ? (
        formatDate(getValue())
      ) : (
        <span className="text-muted-foreground">{MISSING}</span>
      ),
    meta: { className: "whitespace-nowrap" },
  }),
  column.accessor("itemCount", {
    header: text.itemCount,
    cell: ({ getValue }) => formatNumber(getValue()),
    meta: { className: "text-right tabular-nums" },
  }),
  column.accessor("totalQuantity", {
    header: text.totalQuantity,
    cell: ({ getValue }) => formatNumber(getValue()),
    meta: { className: "text-right tabular-nums" },
  }),
  column.accessor((delivery) => t.common.documentStatus[delivery.status], {
    id: "status",
    header: text.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  }),
])
