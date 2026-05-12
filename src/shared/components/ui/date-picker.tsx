import * as React from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { cn } from '@/shared/lib/utils'
import { MONO } from '@/shared/lib/typography'

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
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'w-full flex items-center gap-2 border border-border bg-input px-3 py-2.5 text-sm text-left transition-colors',
            'hover:border-foreground focus:outline-none focus:border-foreground',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            !validSelected && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <span style={validSelected ? {} : MONO}>
            {validSelected ? format(validSelected, "d 'de' MMMM 'de' yyyy", { locale: es }) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border border-border bg-card shadow-none" align="start" style={{ borderRadius: 0 }}>
        <DayPicker
          mode="single"
          selected={validSelected}
          onSelect={handleSelect}
          locale={es}
          captionLayout="label"
          defaultMonth={validSelected ?? new Date()}
          classNames={{
            root: 'p-4',
            months: 'flex flex-col',
            month: 'space-y-3',
            month_caption: 'flex items-center justify-between pb-2 border-b border-border',
            caption_label: 'text-[10px] font-bold uppercase tracking-widest text-foreground',
            nav: 'flex items-center gap-1',
            button_previous: 'flex items-center justify-center w-6 h-6 border border-border hover:border-foreground hover:bg-muted transition-colors cursor-pointer',
            button_next: 'flex items-center justify-center w-6 h-6 border border-border hover:border-foreground hover:bg-muted transition-colors cursor-pointer',
            weeks: 'space-y-1',
            weekdays: 'grid grid-cols-7 mb-1',
            weekday: 'text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground py-1',
            week: 'grid grid-cols-7',
            day: 'flex items-center justify-center',
            day_button: cn(
              'w-8 h-8 text-xs font-medium transition-colors cursor-pointer',
              'hover:bg-muted hover:text-foreground',
              'focus:outline-none focus:bg-muted',
            ),
            selected: '[&>button]:bg-foreground [&>button]:text-background [&>button]:hover:bg-foreground',
            today: '[&>button]:border [&>button]:border-foreground',
            outside: '[&>button]:text-muted-foreground [&>button]:opacity-30',
            disabled: '[&>button]:opacity-20 [&>button]:cursor-not-allowed',
          }}
          components={{
            Chevron: ({ orientation }) =>
              orientation === 'left'
                ? <ChevronLeft className="h-3 w-3" strokeWidth={2} />
                : <ChevronRight className="h-3 w-3" strokeWidth={2} />,
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
