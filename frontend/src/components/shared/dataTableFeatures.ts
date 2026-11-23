import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type ColumnHelper,
  type RowData,
} from "@tanstack/react-table"

/** Extra per-column options DataTable understands. */
export interface DataTableColumnMeta {
  /** Classes for the header and body cells of this column, e.g. "text-right" for numbers. */
  className?: string
}

/**
 * The TanStack Table v9 features DataTable uses: client-side search, sorting and pagination.
 * The sortFns are the ones TanStack picks automatically by value type (text, alphanumeric, datetime, basic).
 */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  columnMeta: {} as DataTableColumnMeta,
})

export type DataTableFeatures = typeof dataTableFeatures

/**
 * Column list for DataTable. Build it with column.columns([...]) from createDataTableColumnHelper(),
 * which keeps each column's own value type (plain ColumnDef arrays lose it and fail to type-check).
 */
export type DataTableColumns<TData extends RowData> = ReturnType<
  ColumnHelper<DataTableFeatures, TData>["columns"]
>

/**
 * Typed column helper for DataTable.
 *
 * @example
 * const column = createDataTableColumnHelper<Product>()
 * const columns = column.columns([
 *   column.accessor("sku", { header: "SKU" }),
 *   column.accessor("quantity", { header: "Bestand", meta: { className: "text-right" } }),
 * ])
 */
export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}
