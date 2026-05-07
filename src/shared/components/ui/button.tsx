import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-primary bg-primary text-primary-foreground hover:opacity-85',
        destructive: 'border border-destructive bg-destructive text-destructive-foreground hover:opacity-85',
        outline: 'border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background',
        secondary: 'border border-border bg-secondary text-secondary-foreground hover:bg-muted',
        ghost: 'hover:bg-accent hover:text-accent-foreground border border-transparent',
        link: 'text-foreground underline-offset-4 hover:underline border-transparent',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 px-3',
        lg: 'h-11 px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
