import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonBlueVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "border border-[#748ED3] bg-gradient-to-br from-[#293B64] to-[#1E2C4E] text-white hover:border-[#2C4892] hover:shadow-[0_0_20px_rgba(116,142,211,0.4)]",
        light: "border border-[#748ED3] bg-gradient-to-br from-[#293B64]/60 to-[#1E2C4E]/60 text-white hover:from-[#293B64] hover:to-[#1E2C4E]",
        outline: "border-2 border-[#748ED3] bg-transparent text-[#748ED3] hover:bg-[#293B64]/20 hover:border-[#2C4892]",
        ghost: "text-[#748ED3] hover:bg-[#293B64]/30 hover:text-[#748ED3]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonBlueProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonBlueVariants> {}

const ButtonBlue = React.forwardRef<HTMLButtonElement, ButtonBlueProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonBlueVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
ButtonBlue.displayName = "ButtonBlue"

export { ButtonBlue, buttonBlueVariants }
