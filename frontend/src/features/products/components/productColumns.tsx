import { createDataTableColumnHelper } from "@/components/shared/dataTableFeatures"
import { ProductImage } from "@/components/shared/ProductImage"
import { StockBadge } from "@/components/shared/StockBadge"
import { ProductRowActions } from "@/features/products/components/ProductRowActions"
import type { Product } from "@/features/products/types"
import { t } from "@/i18n/de"
import { formatNumber } from "@/lib/format"

const column = createDataTableColumnHelper<Product>()
const text = t.products

/** Columns of the Artikel list. `onDelete` opens the confirm dialog for that product. */
export function createProductColumns(onDelete: (product: Product) => void) {
  return column.columns([
    column.display({
      id: "image",
      header: () => <span className="sr-only">{text.columns.image}</span>,
      cell: ({ row }) => (
        <ProductImage
          sku={row.original.sku}
          imageUrl={row.original.imageUrl}
          alt={row.original.name}
        />
      ),
      meta: { className: "w-14" },
    }),
    column.accessor("sku", {
      header: text.columns.sku,
      cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()}</span>,
    }),
    column.accessor("name", {
      header: text.columns.name,
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    }),
    // Accessor returns the German label, so sorting follows what the user sees.
    column.accessor((product) => text.units[product.unit], {
      id: "unit",
      header: text.columns.unit,
    }),
    column.accessor("quantity", {
      header: text.columns.quantity,
      cell: ({ getValue }) => formatNumber(getValue()),
      meta: { className: "text-right tabular-nums" },
    }),
    column.accessor("minQuantity", {
      header: text.columns.minQuantity,
      cell: ({ getValue }) => formatNumber(getValue()),
      meta: { className: "text-right tabular-nums" },
    }),
    column.display({
      id: "stock",
      header: text.columns.stock,
      cell: ({ row }) => (
        <StockBadge quantity={row.original.quantity} minQuantity={row.original.minQuantity} />
      ),
    }),
    column.display({
      id: "actions",
      header: () => <span className="sr-only">{text.columns.actions}</span>,
      cell: ({ row }) => <ProductRowActions product={row.original} onDelete={onDelete} />,
      meta: { className: "w-px text-right" },
    }),
  ])
}
