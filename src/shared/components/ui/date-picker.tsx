import * as React from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { cn } from '@/shared/lib/utils'

type DatePickerProps = {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({ value, onChange, placeholder = 'Seleccionar fecha', disabled, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selected = value && value.length === 10 ? parseISO(value) : undefined
  const validSelected = selected && isValid(selected) ? selected : undefined

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'))
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn('w-full justify-start text-left font-normal', !validSelected && 'text-muted-foreground', className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {validSelected ? format(validSelected, 'dd/MM/yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={validSelected}
          onSelect={handleSelect}
          locale={es}
          captionLayout="dropdown"
          defaultMonth={validSelected ?? new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}
