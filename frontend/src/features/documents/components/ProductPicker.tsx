import { ChevronsUpDown } from "lucide-react"
import { useMemo, useState } from "react"

import { StockBadge } from "@/components/shared/StockBadge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useProducts } from "@/features/products/queries"
import { t } from "@/i18n/de"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const text = t.documents.picker

interface ProductPickerProps {
  /** For a <label htmlFor>. */
  id?: string
  value: number | null
  onChange: (productId: number) => void
  onBlur?: () => void
  /** Products already in other rows: listed, but can't be picked (business rule 6). */
  disabledProductIds?: readonly number[]
  invalid?: boolean
  className?: string
}

/** Searchable product combobox (SKU or name) that shows each product's current Bestand. Loads the products itself. */
export function ProductPicker({
  id,
  value,
  onChange,
  onBlur,
  disabledProductIds = [],
  invalid = false,
  className,
}: ProductPickerProps) {
  const products = useProducts()
  const [open, setOpen] = useState(false)

  const sortedProducts = useMemo(
    () => [...(products.data ?? [])].sort((a, b) => a.sku.localeCompare(b.sku, "de")),
    [products.data],
  )
  const selected = sortedProducts.find((product) => product.id === value)
  const disabledIds = new Set(disabledProductIds)

  let emptyText: string = text.noResults
  if (products.isPending) {
    emptyText = text.loading
  } else if (products.isError) {
    emptyText = text.loadError
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          onBlur={onBlur}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          {selected ? (
            <span className="truncate">
              <span className="font-mono text-xs text-muted-foreground">{selected.sku}</span>{" "}
              {selected.name}
            </span>
          ) : (
            text.placeholder
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-80 p-0">
        <Command>
          <CommandInput placeholder={text.search} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {sortedProducts.map((product) => {
                const isSelected = product.id === value
                const isTaken = !isSelected && disabledIds.has(product.id)
                return (
                  <CommandItem
                    key={product.id}
                    // cmdk searches in this value, so SKU and name are both searchable.
                    value={`${product.sku} ${product.name}`}
                    disabled={isTaken}
                    data-checked={isSelected}
                    onSelect={() => {
                      onChange(product.id)
                      setOpen(false)
                    }}
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">
                        <span className="font-mono text-xs text-muted-foreground">
                          {product.sku}
                        </span>{" "}
                        {product.name}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {isTaken
                          ? text.alreadyAdded
                          : text.stock(
                              formatNumber(product.quantity),
                              t.products.units[product.unit],
                            )}
                      </span>
                    </div>
                    <StockBadge quantity={product.quantity} minQuantity={product.minQuantity} />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
