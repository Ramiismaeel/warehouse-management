import { Pencil, Trash2 } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Product } from "@/features/products/types"
import { t } from "@/i18n/de"

const text = t.products

interface ProductRowActionsProps {
  product: Product
  onDelete: (product: Product) => void
}

/** Bearbeiten (link to the edit page) and Löschen (opens the confirm dialog) for one table row. */
export function ProductRowActions({ product, onDelete }: ProductRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              to={`/artikel/${product.id}/bearbeiten`}
              aria-label={text.actions.editNamed(product.name)}
            >
              <Pencil />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{text.actions.edit}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(product)}
            aria-label={text.actions.deleteNamed(product.name)}
          >
            <Trash2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{text.actions.delete}</TooltipContent>
      </Tooltip>
    </div>
  )
}
