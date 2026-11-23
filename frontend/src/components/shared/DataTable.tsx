import {
  FlexRender,
  useTable,
  type Header,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Search,
  SearchX,
} from "lucide-react"
import type { ReactNode } from "react"

import { EmptyState } from "@/components/shared/EmptyState"
import {
  dataTableFeatures,
  type DataTableColumns,
  type DataTableFeatures,
} from "@/components/shared/dataTableFeatures"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { t } from "@/i18n/de"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZES = [10, 20, 50] as const
const SKELETON_ROWS = 5
const NO_DATA: never[] = []

interface DataTableProps<TData extends RowData> {
  /** Build them with column.columns([...]) from createDataTableColumnHelper<TData>(). */
  columns: DataTableColumns<TData>
  /** undefined while the query has no data yet. */
  data: TData[] | undefined
  /** Shows skeleton rows instead of data. */
  isLoading?: boolean
  /** Column ids the search box searches in. No search box when empty. */
  searchColumns?: string[]
  searchPlaceholder?: string
  /** Shown when there is no data at all. Defaults to a generic "Keine Einträge vorhanden". */
  emptyState?: ReactNode
  /** E.g. newest document first: [{ id: "number", desc: true }]. */
  initialSorting?: SortingState
}

/**
 * Table for every list page: client-side search over chosen columns, sorting by clicking a header,
 * pagination (10 rows, switchable to 20/50), loading skeleton and empty state.
 *
 * @example
 * <DataTable columns={columns} data={query.data} isLoading={query.isPending} searchColumns={["sku", "name"]} />
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  searchColumns = [],
  searchPlaceholder = t.common.table.search,
  emptyState,
  initialSorting = [],
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: data ?? NO_DATA,
    initialState: {
      sorting: initialSorting,
      globalFilter: "",
      pagination: { pageIndex: 0, pageSize: PAGE_SIZES[0] },
    },
    globalFilterFn: "includesString",
    getColumnCanGlobalFilter: (column) => searchColumns.includes(column.id),
  })

  const searchQuery = String(table.state.globalFilter ?? "")
  const { pageIndex, pageSize } = table.state.pagination
  const rows = table.getRowModel().rows
  const columnCount = table.getAllLeafColumns().length
  const hasData = (data?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-4">
      {searchColumns.length > 0 && (
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={searchQuery}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            disabled={isLoading}
          />
        </InputGroup>
      )}

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    aria-sort={ariaSort(header)}
                    className={header.column.columnDef.meta?.className}
                  >
                    {header.isPlaceholder ? null : <HeaderContent header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columnCount }, (_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-5 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount} className="p-0">
                  {hasData ? (
                    <EmptyState icon={SearchX} title={t.common.table.noResults(searchQuery)} />
                  ) : (
                    (emptyState ?? <EmptyState title={t.common.table.empty} />)
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && rows.length > 0 && (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            {t.common.table.entries(table.getRowCount(), formatNumber(table.getRowCount()))}
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span>{t.common.table.rowsPerPage}</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" aria-label={t.common.table.rowsPerPage}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span>
              {t.common.table.pageOf(
                formatNumber(pageIndex + 1),
                formatNumber(Math.max(table.getPageCount(), 1)),
              )}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label={t.common.table.previousPage}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label={t.common.table.nextPage}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Header label; sortable columns get a button that cycles asc → desc → unsorted. */
function HeaderContent<TData extends RowData>({
  header,
}: {
  header: Header<DataTableFeatures, TData, unknown>
}) {
  const { column } = header
  const label = <FlexRender header={header} />

  if (!column.getCanSort()) {
    return label
  }

  const sorted = column.getIsSorted()
  const SortIcon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown
  const columnName =
    typeof column.columnDef.header === "string" ? column.columnDef.header : column.id

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-mx-3 h-8"
      onClick={column.getToggleSortingHandler()}
      aria-label={t.common.table.sortBy(columnName)}
    >
      {label}
      <SortIcon className={cn("size-3.5", !sorted && "text-muted-foreground")} />
    </Button>
  )
}

function ariaSort<TData extends RowData>(header: Header<DataTableFeatures, TData, unknown>) {
  const sorted = header.column.getIsSorted()
  if (sorted === "asc") return "ascending"
  if (sorted === "desc") return "descending"
  return header.column.getCanSort() ? "none" : undefined
}
