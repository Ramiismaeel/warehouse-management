import { Pencil, Trash2 } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Customer } from "@/features/customers/types"
import { t } from "@/i18n/de"

const text = t.customers

interface CustomerRowActionsProps {
  customer: Customer
  onDelete: (customer: Customer) => void
}

/** Bearbeiten (link to the edit page) and Löschen (opens the confirm dialog) for one table row. */
export function CustomerRowActions({ customer, onDelete }: CustomerRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              to={`/kunden/${customer.id}/bearbeiten`}
              aria-label={text.actions.editNamed(customer.name)}
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
            onClick={() => onDelete(customer)}
            aria-label={text.actions.deleteNamed(customer.name)}
          >
            <Trash2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{text.actions.delete}</TooltipContent>
      </Tooltip>
    </div>
  )
}
