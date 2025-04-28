import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "game-button",
        destructive:
          "relative overflow-hidden rounded-md px-4 py-2 font-heading text-sm transition-all bg-gradient-to-b from-destructive to-destructive/80 text-destructive-foreground shadow-[0_0_0_2px_rgba(var(--destructive),0.2),0_3px_0_0_hsl(var(--destructive-dark)),0_6px_12px_-2px_rgba(0,0,0,0.4)] hover:translate-y-0.5 hover:shadow-[0_0_0_2px_rgba(var(--destructive),0.2),0_2px_0_0_hsl(var(--destructive-dark)),0_4px_8px_-2px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_0_0_2px_rgba(var(--destructive),0.2),0_0_0_0_hsl(var(--destructive-dark)),0_2px_4px_-2px_rgba(0,0,0,0.4)]",
        outline:
          "game-button border-2 border-primary bg-transparent text-primary hover:bg-primary/10",
        secondary:
          "relative overflow-hidden rounded-md px-4 py-2 font-heading text-sm transition-all bg-gradient-to-b from-secondary to-secondary-dark text-secondary-foreground shadow-[0_0_0_2px_rgba(var(--secondary),0.2),0_3px_0_0_hsl(var(--secondary-dark)),0_6px_12px_-2px_rgba(0,0,0,0.4)] hover:translate-y-0.5 hover:shadow-[0_0_0_2px_rgba(var(--secondary),0.2),0_2px_0_0_hsl(var(--secondary-dark)),0_4px_8px_-2px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_0_0_2px_rgba(var(--secondary),0.2),0_0_0_0_hsl(var(--secondary-dark)),0_2px_4px_-2px_rgba(0,0,0,0.4)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
