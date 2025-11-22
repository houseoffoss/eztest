import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonOrangeVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "border border-[#905320] bg-gradient-to-br from-[#4D3C32] to-[#342720] text-white hover:border-[#4B372C] hover:shadow-[0_0_20px_rgba(144,83,32,0.4)]",
        light: "border border-[#905320] bg-gradient-to-br from-[#4D3C32]/60 to-[#342720]/60 text-white hover:from-[#4D3C32] hover:to-[#342720]",
        outline: "border-2 border-[#905320] bg-transparent text-[#905320] hover:bg-[#4D3C32]/20 hover:border-[#4B372C]",
        ghost: "text-[#905320] hover:bg-[#4D3C32]/30 hover:text-[#905320]",
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

export interface ButtonOrangeProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonOrangeVariants> {}

const ButtonOrange = React.forwardRef<HTMLButtonElement, ButtonOrangeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonOrangeVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
ButtonOrange.displayName = "ButtonOrange"

export { ButtonOrange, buttonOrangeVariants }
