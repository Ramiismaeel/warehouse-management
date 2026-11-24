import { Link } from "react-router"

import { createDataTableColumnHelper } from "@/components/shared/dataTableFeatures"
import { StatusBadge } from "@/components/shared/StatusBadge"
import type { OutboundOrderSummary } from "@/features/outbound/types"
import { t } from "@/i18n/de"
import { formatDate, formatNumber } from "@/lib/format"

const column = createDataTableColumnHelper<OutboundOrderSummary>()
const text = t.outbound.fields

/** Shown when a Warenausgang has no date. */
const MISSING = "–"

/** Columns of the Warenausgang list. The number links to the detail page. */
export const OUTBOUND_COLUMNS = column.columns([
  column.accessor("number", {
    header: text.number,
    cell: ({ row, getValue }) => (
      <Link
        to={`/warenausgang/${row.original.id}`}
        className="font-mono text-xs font-medium underline-offset-4 hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),
  column.accessor("customerName", {
    header: text.customerName,
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  // ISO dates sort correctly as strings; the cell shows them as dd.MM.yyyy.
  column.accessor((order) => order.orderDate ?? "", {
    id: "orderDate",
    header: text.orderDate,
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
  column.accessor((order) => t.common.documentStatus[order.status], {
    id: "status",
    header: text.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  }),
])
