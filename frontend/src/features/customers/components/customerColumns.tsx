import { createDataTableColumnHelper } from "@/components/shared/dataTableFeatures"
import { CustomerRowActions } from "@/features/customers/components/CustomerRowActions"
import type { Customer } from "@/features/customers/types"
import { t } from "@/i18n/de"

const column = createDataTableColumnHelper<Customer>()
const text = t.customers

/** Shown in a cell whose optional value is missing. */
const MISSING = "–"

/** Columns of the Kunden list. `onDelete` opens the confirm dialog for that customer. */
export function createCustomerColumns(onDelete: (customer: Customer) => void) {
  return column.columns([
    column.accessor("name", {
      header: text.columns.name,
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    }),
    column.accessor((customer) => customer.email ?? "", {
      id: "email",
      header: text.columns.email,
      cell: ({ getValue }) =>
        getValue() || <span className="text-muted-foreground">{MISSING}</span>,
    }),
    column.accessor((customer) => customer.phone ?? "", {
      id: "phone",
      header: text.columns.phone,
      cell: ({ getValue }) =>
        getValue() || <span className="text-muted-foreground">{MISSING}</span>,
      meta: { className: "whitespace-nowrap" },
    }),
    // "10115 Berlin". Search also finds the PLZ.
    column.accessor((customer) => [customer.zipCode, customer.city].filter(Boolean).join(" "), {
      id: "city",
      header: text.columns.city,
      cell: ({ getValue }) =>
        getValue() || <span className="text-muted-foreground">{MISSING}</span>,
    }),
    column.display({
      id: "actions",
      header: () => <span className="sr-only">{text.columns.actions}</span>,
      cell: ({ row }) => <CustomerRowActions customer={row.original} onDelete={onDelete} />,
      meta: { className: "w-px text-right" },
    }),
  ])
}
