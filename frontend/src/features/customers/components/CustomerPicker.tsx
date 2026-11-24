import { ChevronsUpDown } from "lucide-react"
import { useMemo, useState } from "react"

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
import { useCustomers } from "@/features/customers/queries"
import { t } from "@/i18n/de"
import { cn } from "@/lib/utils"

const text = t.customers.picker

interface CustomerPickerProps {
  /** For a <label htmlFor>. */
  id?: string
  value: number | null
  onChange: (customerId: number) => void
  onBlur?: () => void
  invalid?: boolean
  className?: string
}

/** Searchable customer combobox (name or Ort) that shows PLZ + Ort under each name. Loads the customers itself. */
export function CustomerPicker({
  id,
  value,
  onChange,
  onBlur,
  invalid = false,
  className,
}: CustomerPickerProps) {
  const customers = useCustomers()
  const [open, setOpen] = useState(false)

  const sortedCustomers = useMemo(
    () => [...(customers.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, "de")),
    [customers.data],
  )
  const selected = sortedCustomers.find((customer) => customer.id === value)

  let emptyText: string = text.noResults
  if (customers.isPending) {
    emptyText = text.loading
  } else if (customers.isError) {
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
          <span className="truncate">{selected ? selected.name : text.placeholder}</span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-72 p-0">
        <Command>
          <CommandInput placeholder={text.search} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {sortedCustomers.map((customer) => {
                const cityLine = [customer.zipCode, customer.city].filter(Boolean).join(" ")
                return (
                  <CommandItem
                    key={customer.id}
                    // cmdk searches in this value; the id keeps two customers with the same name apart.
                    value={`${customer.name} ${cityLine} #${customer.id}`}
                    data-checked={customer.id === value}
                    onSelect={() => {
                      onChange(customer.id)
                      setOpen(false)
                    }}
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{customer.name}</span>
                      {cityLine && (
                        <span className="text-xs font-normal text-muted-foreground">
                          {cityLine}
                        </span>
                      )}
                    </div>
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
