import { Link } from "react-router"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DocumentItem } from "@/features/documents/types"
import { t } from "@/i18n/de"
import { formatNumber } from "@/lib/format"

const text = t.documents.itemsTable

/** Read-only positions of a Beleg on its detail page. The product name links to the Artikel. */
export function DocumentItemsTable({ items }: { items: DocumentItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">{text.position}</TableHead>
          <TableHead>{text.sku}</TableHead>
          <TableHead>{text.product}</TableHead>
          <TableHead className="text-right">{text.quantity}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.productId}>
            <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
            <TableCell className="font-mono text-xs">{item.sku}</TableCell>
            <TableCell>
              <Link
                to={`/artikel/${item.productId}/bearbeiten`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {item.name}
              </Link>
            </TableCell>
            <TableCell className="text-right whitespace-nowrap tabular-nums">
              {formatNumber(item.quantity)} {t.products.units[item.unit]}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
