import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { de } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { t } from "@/i18n/de"
import { formatDate, parseIsoDate, toIsoDate } from "@/lib/format"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  /** For a <label htmlFor>. */
  id?: string
  /** ISO date "yyyy-MM-dd" as the backend sends it, or "" for no date. */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  invalid?: boolean
  className?: string
}

/** Date field with a German calendar popover (Monday first). Shows dd.MM.yyyy, works with ISO dates. */
export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  invalid = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseIsoDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          onBlur={onBlur}
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          {selected ? formatDate(selected) : t.common.datePicker.placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={de}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (date) {
              onChange(toIsoDate(date))
            }
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
