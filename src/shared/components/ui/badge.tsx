import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-foreground bg-foreground text-background',
        secondary: 'border-border bg-transparent text-foreground',
        destructive: 'border-destructive bg-destructive text-destructive-foreground',
        outline: 'border-border text-foreground bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
