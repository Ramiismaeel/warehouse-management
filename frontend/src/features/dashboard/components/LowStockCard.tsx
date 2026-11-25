import { CircleCheck } from "lucide-react"
import { Link } from "react-router"

import { EmptyState } from "@/components/shared/EmptyState"
import { ProductImage } from "@/components/shared/ProductImage"
import { StockBadge } from "@/components/shared/StockBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Product } from "@/features/products/types"
import { t } from "@/i18n/de"
import { formatNumber } from "@/lib/format"

const text = t.dashboard.lowStock

interface LowStockCardProps {
  /** At most 10 from the backend, lowest Bestand first. */
  products: Product[]
  /** All low-stock products, may be more than shown. */
  total: number
}

/** Products at or below their Mindestbestand (business rule 8). Each row links to the Artikel. */
export function LowStockCard({ products, total }: LowStockCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        {products.length > 0 && (
          <CardDescription>
            {text.description(formatNumber(products.length), formatNumber(total))}
          </CardDescription>
        )}
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/artikel">{text.showAll}</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <EmptyState
            icon={CircleCheck}
            title={text.empty}
            description={text.emptyDescription}
            className="py-6"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{text.product}</TableHead>
                <TableHead className="text-right">{text.quantity}</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  {text.minQuantity}
                </TableHead>
                <TableHead>{text.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link
                      to={`/artikel/${product.id}/bearbeiten`}
                      className="flex items-center gap-3 underline-offset-4 hover:underline"
                    >
                      <ProductImage
                        sku={product.sku}
                        imageUrl={product.imageUrl}
                        alt=""
                        className="size-8"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{product.name}</span>
                        <span className="block font-mono text-xs text-muted-foreground">
                          {product.sku}
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap tabular-nums">
                    {formatNumber(product.quantity)} {t.products.units[product.unit]}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">
                    {formatNumber(product.minQuantity)}
                  </TableCell>
                  <TableCell>
                    <StockBadge quantity={product.quantity} minQuantity={product.minQuantity} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
