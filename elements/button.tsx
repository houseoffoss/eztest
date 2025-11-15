import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/25",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Glass variants tuned to screenshot (moderate pill radius)
        glass:
          "rounded-2xl backdrop-blur-xl border border-white/20 text-foreground bg-white/8 shadow-md hover:bg-white/10 active:bg-white/12",
        "glass-primary":
          "rounded-2xl backdrop-blur-xl border border-primary/40 text-primary-foreground bg-primary/20 shadow-md hover:bg-primary/25 active:bg-primary/30",
        "glass-accent":
          "rounded-2xl backdrop-blur-xl border border-accent/40 text-accent-foreground bg-accent/20 shadow-md hover:bg-accent/25 active:bg-accent/30",
        "glass-destructive":
          "rounded-2xl backdrop-blur-xl border border-red-400/40 text-red-50 bg-red-500/20 shadow-md hover:bg-red-500/30 active:bg-red-500/35",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      suppressHydrationWarning
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
